using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using KitCerto.Application.Orders.Webhook;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/webhooks")]
    [Produces("application/json")]
    public sealed class WebhooksController : ControllerBase
    {
        private readonly IMediator _mediator;

        public WebhooksController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>Recebe notificações do Mercado Pago (pagamentos) e atualiza o status do pedido.</summary>
        /// <remarks>Não usa [Authorize] — o MP chama esta URL sem token. Em produção, valide x-signature ou x-signature-id se configurado.</remarks>
        [HttpPost("mercadopago")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> MercadoPago(CancellationToken ct)
        {
            MercadoPagoWebhookPayload? payload;
            try
            {
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync(ct);
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
