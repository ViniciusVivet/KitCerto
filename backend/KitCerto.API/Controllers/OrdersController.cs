using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using KitCerto.Application.Orders.CreateCheckout;
using KitCerto.Application.Orders.Queries.ListOrders;
using KitCerto.Application.Orders.Queries.GetOrderById;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public sealed class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IConfiguration _cfg;

        public OrdersController(IMediator mediator, IConfiguration cfg)
        {
            _mediator = mediator;
            _cfg = cfg;
        }

        public sealed record CreateOrderCheckoutRequest
        {
            public required CreateOrderItem[] Items { get; init; }
            public CreateOrderShipping? Shipping { get; init; }
        }

        [Authorize]
        [HttpPost("checkout")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCheckout([FromBody] CreateOrderCheckoutRequest req, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Usuário não autenticado." });

            if (req.Items is null || req.Items.Length == 0)
                return BadRequest(new { message = "Carrinho vazio." });

            var successUrl = _cfg["MercadoPago:SuccessUrl"] ?? "";
            var failureUrl = _cfg["MercadoPago:FailureUrl"] ?? "";
            var pendingUrl = _cfg["MercadoPago:PendingUrl"] ?? "";
            if (string.IsNullOrWhiteSpace(successUrl) || string.IsNullOrWhiteSpace(failureUrl) || string.IsNullOrWhiteSpace(pendingUrl))
                return BadRequest(new { message = "URLs de retorno não configuradas." });

            var result = await _mediator.Send(new CreateOrderCheckoutCmd(
                UserId: userId,
                Items: req.Items,
                Shipping: req.Shipping,
                Currency: "BRL",
                SuccessUrl: successUrl,
                FailureUrl: failureUrl,
                PendingUrl: pendingUrl
            ), ct);

            if (!result.Success)
                return BadRequest(new { code = result.ErrorCode, message = result.ErrorMessage });

            return Ok(new
            {
                result.OrderId,
                result.TotalAmount,
                result.Currency,
                result.CheckoutUrl
            });
        }

        [Authorize]
        [HttpGet]
        [ProducesResponseType(typeof(OrderDto[]), StatusCodes.Status200OK)]
        public async Task<IActionResult> List(CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Usuário não autenticado." });

            var list = await _mediator.Send(new ListOrdersQuery(userId), ct);
            return Ok(list);
        }

        [Authorize]
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] string id, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Usuário não autenticado." });

            var order = await _mediator.Send(new GetOrderByIdQuery(userId, id), ct);
            if (order is null) return NotFound(new { message = "Pedido não encontrado." });
            return Ok(order);
        }

        private string? GetUserId()
        {
            return User?.FindFirst("preferred_username")?.Value
                ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User?.Identity?.Name;
        }
    }
}
