using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using KitCerto.Application.PaymentMethods.Add;
using KitCerto.Application.PaymentMethods.Delete;
using KitCerto.Application.PaymentMethods.Queries.ListPaymentMethods;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/me/payment-methods")]
    [Produces("application/json")]
    [Authorize]
    public sealed class PaymentMethodsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PaymentMethodsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>Lista os métodos de pagamento salvos do usuário.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaymentMethodDto[]), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> List(CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Usuário não autenticado." });

            var list = await _mediator.Send(new ListPaymentMethodsQuery(userId), ct);
            return Ok(list);
        }

        /// <summary>Adiciona um novo cartão (token do Mercado Pago).</summary>
        [HttpPost]
        [ProducesResponseType(typeof(AddPaymentMethodResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Add([FromBody] AddPaymentMethodRequest body, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Usuário não autenticado." });
            if (string.IsNullOrWhiteSpace(body?.Token))
                return BadRequest(new { message = "Token do cartão é obrigatório." });

            var email = User?.FindFirst("email")?.Value ?? User?.FindFirst("preferred_username")?.Value;
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { message = "E-mail do usuário não disponível no token." });

            var result = await _mediator.Send(new AddPaymentMethodCmd(
                UserId: userId,
                UserEmail: email,
                UserFirstName: body.FirstName,
                UserLastName: body.LastName,
                Token: body.Token
            ), ct);

            return Ok(result);
        }

        /// <summary>Remove um método de pagamento.</summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Usuário não autenticado." });
            if (string.IsNullOrWhiteSpace(id))
                return NotFound();

            var deleted = await _mediator.Send(new DeletePaymentMethodCmd(userId, id), ct);
            if (!deleted)
                return NotFound(new { message = "Método de pagamento não encontrado." });
            return NoContent();
        }

        private string? GetUserId()
        {
            return User?.FindFirst("preferred_username")?.Value
                ?? User?.FindFirst("sub")?.Value
                ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User?.Identity?.Name;
        }
    }

    public sealed class AddPaymentMethodRequest
    {
        public string Token { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}
