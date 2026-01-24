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
                notification_url = string.IsNullOrWhiteSpace(notificationUrl) ? null : notificationUrl
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
    }
}
