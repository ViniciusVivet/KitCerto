using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using KitCerto.Application.Payments.CreateCheckout;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public sealed class PaymentsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IConfiguration _cfg;

        public PaymentsController(IMediator mediator, IConfiguration cfg)
        {
            _mediator = mediator;
            _cfg = cfg;
        }

        public sealed record CreateCheckoutPreferenceRequest
        {
            public string Description { get; init; } = string.Empty;
            public decimal Amount { get; init; }
            public string? Currency { get; init; }
            public string? SuccessUrl { get; init; }
            public string? FailureUrl { get; init; }
            public string? PendingUrl { get; init; }
            public string? ExternalReference { get; init; }
        }

        /// <summary>Cria uma preferência de checkout no Mercado Pago (sandbox/produção)</summary>
        [Authorize]
        [HttpPost("checkout")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateCheckout([FromBody] CreateCheckoutPreferenceRequest req, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(req.Description))
                return BadRequest(new { message = "Descrição é obrigatória." });
            if (req.Amount <= 0)
                return BadRequest(new { message = "Valor precisa ser maior que zero." });

            var successUrl = string.IsNullOrWhiteSpace(req.SuccessUrl) ? _cfg["MercadoPago:SuccessUrl"] : req.SuccessUrl;
            var failureUrl = string.IsNullOrWhiteSpace(req.FailureUrl) ? _cfg["MercadoPago:FailureUrl"] : req.FailureUrl;
            var pendingUrl = string.IsNullOrWhiteSpace(req.PendingUrl) ? _cfg["MercadoPago:PendingUrl"] : req.PendingUrl;

            if (string.IsNullOrWhiteSpace(successUrl) || string.IsNullOrWhiteSpace(failureUrl) || string.IsNullOrWhiteSpace(pendingUrl))
                return BadRequest(new { message = "URLs de retorno (success/failure/pending) não configuradas." });

            var currency = string.IsNullOrWhiteSpace(req.Currency) ? "BRL" : req.Currency!;
            var externalReference = string.IsNullOrWhiteSpace(req.ExternalReference)
                ? $"order-{Guid.NewGuid():N}"
                : req.ExternalReference!;

            var result = await _mediator.Send(new CreateCheckoutPreferenceCmd(
                Description: req.Description,
                Amount: req.Amount,
                Currency: currency,
                SuccessUrl: successUrl!,
                FailureUrl: failureUrl!,
                PendingUrl: pendingUrl!,
                ExternalReference: externalReference
            ), ct);

            var sandbox = _cfg.GetValue<bool?>("MercadoPago:Sandbox") ?? true;
            var checkoutUrl = sandbox && !string.IsNullOrWhiteSpace(result.SandboxInitPoint)
                ? result.SandboxInitPoint
                : result.InitPoint;

            return Ok(new
            {
                result.PreferenceId,
                result.InitPoint,
                result.SandboxInitPoint,
                checkoutUrl,
                sandbox
            });
        }
    }
}
