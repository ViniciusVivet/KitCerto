using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using KitCerto.Application.Orders.Webhook;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/webhooks")]
    [Produces("application/json")]
    public sealed class WebhooksController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IConfiguration _cfg;

        public WebhooksController(IMediator mediator, IConfiguration cfg)
        {
            _mediator = mediator;
            _cfg = cfg;
        }

        /// <summary>Recebe notificações do Mercado Pago e atualiza o status do pedido.</summary>
        /// <remarks>
        /// Valida a assinatura x-signature quando MercadoPago:WebhookSecret está configurado.
        /// Algoritmo: HMAC-SHA256 sobre "id={notification_id}&ts={x-request-ts}" com o secret.
        /// Docs: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
        /// </remarks>
        [HttpPost("mercadopago")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> MercadoPago(CancellationToken ct)
        {
            // Lê o corpo uma única vez (stream não é reutilizável)
            string body;
            try
            {
                using var reader = new StreamReader(Request.Body, Encoding.UTF8);
                body = await reader.ReadToEndAsync(ct);
            }
            catch
            {
                return BadRequest(new { message = "Erro ao ler corpo da requisição." });
            }

            // Validação de assinatura (opcional mas recomendado em produção)
            var webhookSecret = _cfg["MercadoPago:WebhookSecret"];
            if (!string.IsNullOrWhiteSpace(webhookSecret))
            {
                var xSignature  = Request.Headers["x-signature"].ToString();
                var xRequestTs  = Request.Headers["x-request-id"].ToString();   // MP usa x-request-id como timestamp-id
                var notifId     = Request.Query["id"].ToString();

                if (!ValidateMpSignature(xSignature, notifId, xRequestTs, webhookSecret))
                    return Unauthorized(new { message = "Assinatura inválida." });
            }

            MercadoPagoWebhookPayload? payload;
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                payload = JsonSerializer.Deserialize<MercadoPagoWebhookPayload>(body, options);
            }
            catch
            {
                return BadRequest(new { message = "Payload inválido." });
            }

            if (payload is null || string.IsNullOrWhiteSpace(payload.Type))
                return BadRequest(new { message = "Campo type é obrigatório." });

            var dataId = payload.Data?.Id;
            var processed = await _mediator.Send(new ProcessMercadoPagoWebhookCmd(payload.Type, dataId), ct);

            return Ok(new { processed });
        }

        /// <summary>
        /// Valida a assinatura HMAC-SHA256 enviada pelo Mercado Pago no header x-signature.
        /// Formato do header: "ts=&lt;timestamp&gt;,v1=&lt;hmac&gt;"
        /// Mensagem assinada: "id=&lt;notification_id&gt;;request-id=&lt;x-request-id&gt;;ts=&lt;timestamp&gt;;"
        /// </summary>
        private static bool ValidateMpSignature(string xSignature, string notificationId, string requestId, string secret)
        {
            if (string.IsNullOrWhiteSpace(xSignature)) return false;

            // Extrai ts e v1 do header
            string? ts = null, v1 = null;
            foreach (var part in xSignature.Split(','))
            {
                var kv = part.Trim().Split('=', 2);
                if (kv.Length != 2) continue;
                if (kv[0] == "ts") ts = kv[1];
                if (kv[0] == "v1") v1 = kv[1];
            }

            if (string.IsNullOrWhiteSpace(ts) || string.IsNullOrWhiteSpace(v1)) return false;

            var message = $"id={notificationId};request-id={requestId};ts={ts};";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var expected = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(message))).ToLowerInvariant();

            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expected),
                Encoding.UTF8.GetBytes(v1.ToLowerInvariant())
            );
        }
    }

    /// <summary>Estrutura do POST enviado pelo Mercado Pago.</summary>
    public sealed class MercadoPagoWebhookPayload
    {
        public string? Id { get; set; }
        public bool Live_mode { get; set; }
        public string? Type { get; set; }
        public string? Date_created { get; set; }
        public string? User_id { get; set; }
        public string? Api_version { get; set; }
        public string? Action { get; set; }
        public MercadoPagoWebhookData? Data { get; set; }
    }

    public sealed class MercadoPagoWebhookData
    {
        public string? Id { get; set; }
    }
}
