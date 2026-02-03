using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using KitCerto.Application.Support.CreateTicket;
using KitCerto.Application.Support.AddTicketMessage;
using KitCerto.Application.Support.Queries.ListMyTickets;
using KitCerto.Application.Support.Queries.ListTicketMessages;
using KitCerto.Application.Support.Queries.ListTicketsForSeller;
using KitCerto.Application.Support.Queries.ListAllTickets;
using KitCerto.Domain.Support;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize]
    public sealed class TicketsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TicketsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(typeof(TicketDto[]), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListMy(CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            var list = await _mediator.Send(new ListMyTicketsQuery(userId), ct);
            var dtos = list.Select(t => new TicketDto
            {
                Id = t.Id,
                Subject = t.Subject,
                Message = t.Message,
                Status = t.Status,
                OrderId = t.OrderId,
                SellerId = t.SellerId,
                CreatedAtUtc = t.CreatedAtUtc
            }).ToArray();
            return Ok(dtos);
        }

        /// <summary>Lista chamados atribuídos à loja do vendedor (seller).</summary>
        [HttpGet("for-seller")]
        [ProducesResponseType(typeof(TicketForSellerDto[]), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListForSeller(CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            var list = await _mediator.Send(new ListTicketsForSellerQuery(userId), ct);
            return Ok(list);
        }

        /// <summary>Lista todos os chamados (admin).</summary>
        [Authorize(Roles = "admin")]
        [HttpGet("all")]
        [ProducesResponseType(typeof(AllTicketsDto[]), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListAll(CancellationToken ct)
        {
            var list = await _mediator.Send(new ListAllTicketsQuery(), ct);
            return Ok(list);
        }

        [HttpPost]
        [ProducesResponseType(typeof(CreateTicketResult), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateTicketRequest body, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            if (string.IsNullOrWhiteSpace(body?.Subject) || string.IsNullOrWhiteSpace(body?.Message))
                return BadRequest(new { message = "Assunto e mensagem são obrigatórios." });
            var orderId = string.IsNullOrWhiteSpace(body.OrderId) ? null : body.OrderId.Trim();
            var id = await _mediator.Send(new CreateTicketCmd(userId, body.Subject.Trim(), body.Message.Trim(), orderId), ct);
            return StatusCode(StatusCodes.Status201Created, new CreateTicketResult { Id = id });
        }

        [HttpGet("{id}/messages")]
        [ProducesResponseType(typeof(TicketMessageDto[]), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ListMessages([FromRoute] string id, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            var isAdmin = User.IsInRole("admin");
            var list = await _mediator.Send(new ListTicketMessagesQuery(userId, id, isAdmin), ct);
            return Ok(list);
        }

        [HttpPost("{id}/messages")]
        [ProducesResponseType(typeof(AddTicketMessageResult), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AddMessage([FromRoute] string id, [FromBody] AddTicketMessageRequest body, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            if (string.IsNullOrWhiteSpace(body?.Message))
                return BadRequest(new { message = "Mensagem é obrigatória." });
            var isAdmin = User.IsInRole("admin");
            var result = await _mediator.Send(new AddTicketMessageCmd(userId, id, body.Message.Trim(), isAdmin), ct);
            if (result is null)
                return NotFound(new { message = "Chamado não encontrado." });
            return StatusCode(StatusCodes.Status201Created, result);
        }

        private string? GetUserId()
        {
            return User?.FindFirst("preferred_username")?.Value
                ?? User?.FindFirst("sub")?.Value
                ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User?.Identity?.Name;
        }
    }

    public sealed class TicketDto
    {
        public string Id { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? OrderId { get; set; }
        public string? SellerId { get; set; }
        public System.DateTime CreatedAtUtc { get; set; }
    }

    public sealed class CreateTicketRequest
    {
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? OrderId { get; set; }
    }

    public sealed class CreateTicketResult
    {
        public string Id { get; set; } = string.Empty;
    }

    public sealed class AddTicketMessageRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}
