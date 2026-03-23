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
using KitCerto.Application.Orders.Queries.ListAllOrders;
using KitCerto.Domain.Repositories;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public sealed class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IConfiguration _cfg;
        private readonly IOrdersRepo _ordersRepo;

        public OrdersController(IMediator mediator, IConfiguration cfg, IOrdersRepo ordersRepo)
        {
            _mediator = mediator;
            _cfg = cfg;
            _ordersRepo = ordersRepo;
        }

        public sealed record CreateOrderCheckoutRequest
        {
            public required CreateOrderItem[] Items { get; init; }
            public CreateOrderShipping? Shipping { get; init; }
            public string? CouponCode { get; init; }
            // Campos de convidado (obrigatório quando não autenticado)
            public string? GuestName  { get; init; }
            public string? GuestEmail { get; init; }
            public string? GuestPhone { get; init; }
        }

        /// <summary>
        /// Cria um checkout no Mercado Pago. Funciona para usuários autenticados
        /// e para convidados (GuestName + GuestEmail obrigatórios nesse caso).
        /// </summary>
        [HttpPost("checkout")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCheckout([FromBody] CreateOrderCheckoutRequest req, CancellationToken ct)
        {
            if (req.Items is null || req.Items.Length == 0)
                return BadRequest(new { message = "Carrinho vazio." });

            var userId = GetUserId(); // null para convidados
            var isGuest = string.IsNullOrWhiteSpace(userId);

            // Convidados precisam informar nome e e-mail
            if (isGuest)
            {
                if (string.IsNullOrWhiteSpace(req.GuestName))
                    return BadRequest(new { code = "guest_name_required", message = "Informe seu nome para continuar." });
                if (string.IsNullOrWhiteSpace(req.GuestEmail) || !req.GuestEmail.Contains('@'))
                    return BadRequest(new { code = "guest_email_required", message = "Informe um e-mail válido para continuar." });
            }

            var successUrl = _cfg["MercadoPago:SuccessUrl"] ?? "";
            var failureUrl = _cfg["MercadoPago:FailureUrl"] ?? "";
            var pendingUrl = _cfg["MercadoPago:PendingUrl"] ?? "";
            if (string.IsNullOrWhiteSpace(successUrl) || string.IsNullOrWhiteSpace(failureUrl) || string.IsNullOrWhiteSpace(pendingUrl))
                return BadRequest(new { message = "URLs de retorno não configuradas." });

            var payerEmail = User?.FindFirst("email")?.Value ?? User?.FindFirst("preferred_username")?.Value;

            var result = await _mediator.Send(new CreateOrderCheckoutCmd(
                UserId:     userId,
                PayerEmail: payerEmail,
                GuestName:  req.GuestName?.Trim(),
                GuestEmail: req.GuestEmail?.Trim().ToLowerInvariant(),
                GuestPhone: req.GuestPhone?.Trim(),
                Items:      req.Items,
                Shipping:   req.Shipping,
                Currency:   "BRL",
                SuccessUrl: successUrl,
                FailureUrl: failureUrl,
                PendingUrl: pendingUrl,
                CouponCode: string.IsNullOrWhiteSpace(req.CouponCode) ? null : req.CouponCode.Trim()
            ), ct);

            if (!result.Success)
                return BadRequest(new { code = result.ErrorCode, message = result.ErrorMessage });

            return Ok(new
            {
                result.OrderId,
                result.TotalAmount,
                result.Currency,
                CheckoutUrl = result.CheckoutUrl,
                result.GuestToken   // null para usuários autenticados
            });
        }

        /// <summary>
        /// Consulta status de um pedido de convidado via token secreto.
        /// Não requer autenticação — o token de 128 bits funciona como credencial temporária.
        /// </summary>
        [HttpGet("guest/{orderId}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetGuestOrderStatus(
            [FromRoute] string orderId,
            [FromQuery] string token,
            CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest(new { message = "Token obrigatório." });

            var order = await _ordersRepo.GetByIdAndGuestTokenAsync(orderId, token, ct);
            if (order is null)
                return NotFound(new { message = "Pedido não encontrado." });

            return Ok(new
            {
                order.Id,
                order.Status,
                order.TotalAmount,
                order.Currency,
                order.CreatedAtUtc,
                Items = order.Items.Select(i => new { i.ProductId, i.Name, i.UnitPrice, i.Quantity }),
            });
        }

        /// <summary>Listar todos os pedidos (Admin)</summary>
        [Authorize(Roles = "admin")]
        [HttpGet("all")]
        [ProducesResponseType(typeof(OrderDto[]), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListAll(CancellationToken ct)
        {
            var list = await _mediator.Send(new ListAllOrdersQuery(), ct);
            return Ok(list);
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
            if (User?.Identity?.IsAuthenticated != true) return null;
            return User?.FindFirst("preferred_username")?.Value
                ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User?.Identity?.Name;
        }
    }
}
