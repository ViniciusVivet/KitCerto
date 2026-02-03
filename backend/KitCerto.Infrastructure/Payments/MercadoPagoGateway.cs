using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using KitCerto.Domain.Payments;

namespace KitCerto.Infrastructure.Payments
{
    public sealed class MercadoPagoGateway : IPaymentGateway
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _cfg;

        public MercadoPagoGateway(IHttpClientFactory factory, IConfiguration cfg)
        {
            _http = factory.CreateClient("MercadoPago");
            _cfg = cfg;
        }

        public async Task<CheckoutSession> CreateCheckoutAsync(CheckoutRequest request, CancellationToken ct)
        {
            var accessToken = _cfg["MercadoPago:AccessToken"];
            if (string.IsNullOrWhiteSpace(accessToken))
                throw new InvalidOperationException("MercadoPago:AccessToken não configurado.");

            var notificationUrl = _cfg["MercadoPago:NotificationUrl"];

            var payload = new
            {
                items = new[]
                {
                    new
                    {
                        title = request.Description,
                        quantity = 1,
                        currency_id = request.Currency,
                        unit_price = request.Amount
                    }
                },
                back_urls = new
                {
                    success = request.SuccessUrl,
                    failure = request.FailureUrl,
                    pending = request.PendingUrl
                },
                auto_return = "approved",
                external_reference = request.ExternalReference,
                notification_url = string.IsNullOrWhiteSpace(notificationUrl) ? null : notificationUrl,
                payer = string.IsNullOrWhiteSpace(request.PayerEmail) ? null : new { email = request.PayerEmail }
            };

            var reqJson = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            });

            using var msg = new HttpRequestMessage(HttpMethod.Post, "checkout/preferences");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            msg.Content = new StringContent(reqJson, Encoding.UTF8, "application/json");

            using var res = await _http.SendAsync(msg, ct);
            var body = await res.Content.ReadAsStringAsync(ct);

            if (!res.IsSuccessStatusCode)
                throw new InvalidOperationException($"Mercado Pago erro: {(int)res.StatusCode} - {body}");

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;
            var preferenceId = root.GetProperty("id").GetString() ?? string.Empty;
            var initPoint = root.GetProperty("init_point").GetString() ?? string.Empty;
            var sandboxInitPoint = root.TryGetProperty("sandbox_init_point", out var s) ? s.GetString() : null;

            return new CheckoutSession(preferenceId, initPoint, sandboxInitPoint);
        }

        public async Task<string> CreateOrGetCustomerAsync(string email, string? firstName, string? lastName, CancellationToken ct)
        {
            var accessToken = _cfg["MercadoPago:AccessToken"];
            if (string.IsNullOrWhiteSpace(accessToken))
                throw new InvalidOperationException("MercadoPago:AccessToken não configurado.");

            // Buscar por e-mail primeiro
            using var searchMsg = new HttpRequestMessage(HttpMethod.Get, $"v1/customers/search?email={Uri.EscapeDataString(email)}");
            searchMsg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using var searchRes = await _http.SendAsync(searchMsg, ct);
            var searchBody = await searchRes.Content.ReadAsStringAsync(ct);
            if (searchRes.IsSuccessStatusCode)
            {
                using var searchDoc = JsonDocument.Parse(searchBody);
                var results = searchDoc.RootElement.TryGetProperty("results", out var r) && r.ValueKind == JsonValueKind.Array && r.GetArrayLength() > 0
                    ? r : default;
                if (results.ValueKind == JsonValueKind.Array && results.GetArrayLength() > 0)
                {
                    var first = results[0];
                    var id = first.TryGetProperty("id", out var idProp) ? idProp.GetString() : null;
                    if (!string.IsNullOrWhiteSpace(id))
                        return id;
                }
            }

            // Criar customer
            var createPayload = new
            {
                email,
                first_name = firstName ?? "Cliente",
                last_name = lastName ?? "KitCerto"
            };
            var createJson = JsonSerializer.Serialize(createPayload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            });
            using var createMsg = new HttpRequestMessage(HttpMethod.Post, "v1/customers");
            createMsg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            createMsg.Content = new StringContent(createJson, Encoding.UTF8, "application/json");
            using var createRes = await _http.SendAsync(createMsg, ct);
            var createBody = await createRes.Content.ReadAsStringAsync(ct);
            if (!createRes.IsSuccessStatusCode)
                throw new InvalidOperationException($"Mercado Pago create customer: {(int)createRes.StatusCode} - {createBody}");
            using var createDoc = JsonDocument.Parse(createBody);
            var customerId = createDoc.RootElement.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
            if (string.IsNullOrWhiteSpace(customerId))
                throw new InvalidOperationException("Mercado Pago retornou customer sem id.");
            return customerId;
        }

        public async Task<AddCardResult> AddCardToCustomerAsync(string customerId, string token, CancellationToken ct)
        {
            var accessToken = _cfg["MercadoPago:AccessToken"];
            if (string.IsNullOrWhiteSpace(accessToken))
                throw new InvalidOperationException("MercadoPago:AccessToken não configurado.");

            var payload = new { token };
            var json = JsonSerializer.Serialize(payload);
            using var msg = new HttpRequestMessage(HttpMethod.Post, $"v1/customers/{customerId}/cards");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            msg.Content = new StringContent(json, Encoding.UTF8, "application/json");
            using var res = await _http.SendAsync(msg, ct);
            var body = await res.Content.ReadAsStringAsync(ct);
            if (!res.IsSuccessStatusCode)
                throw new InvalidOperationException($"Mercado Pago add card: {(int)res.StatusCode} - {body}");
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;
            var mpCardId = root.TryGetProperty("id", out var idEl) ? idEl.GetRawText().Trim('"') : null;
            var last4 = root.TryGetProperty("last_four_digits", out var l4) ? l4.GetString() : null;
            var brand = "card";
            if (root.TryGetProperty("payment_method", out var pm) && pm.TryGetProperty("id", out var pmId))
                brand = pmId.GetString() ?? "card";
            if (string.IsNullOrWhiteSpace(mpCardId) || string.IsNullOrWhiteSpace(last4))
                throw new InvalidOperationException("Resposta do MP sem id ou last_four_digits.");
            return new AddCardResult(mpCardId, last4, brand ?? "card");
        }

        public async Task<PaymentInfo?> GetPaymentInfoAsync(string paymentId, CancellationToken ct)
        {
            var accessToken = _cfg["MercadoPago:AccessToken"];
            if (string.IsNullOrWhiteSpace(accessToken))
                return null;
            using var msg = new HttpRequestMessage(HttpMethod.Get, $"v1/payments/{paymentId}");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using var res = await _http.SendAsync(msg, ct);
            if (!res.IsSuccessStatusCode) return null;
            var body = await res.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;
            var externalRef = root.TryGetProperty("external_reference", out var er) ? er.GetString() : null;
            var status = root.TryGetProperty("status", out var st) ? st.GetString() : null;
            if (string.IsNullOrWhiteSpace(externalRef) || string.IsNullOrWhiteSpace(status)) return null;
            return new PaymentInfo(externalRef, status);
        }
    }
}
