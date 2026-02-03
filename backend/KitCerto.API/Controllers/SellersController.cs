using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using KitCerto.Domain.Sellers;
using KitCerto.Application.Products.Queries.ListProductsBySeller;
using KitCerto.Application.Products.Create;
using KitCerto.Application.Orders.Queries.ListOrdersForSeller;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/sellers")]
    [Produces("application/json")]
    [Authorize]
    public sealed class SellersController : ControllerBase
    {
        private readonly ISellerRequestsRepo _repo;
        private readonly ISellersRepo _sellersRepo;
        private readonly IMediator _mediator;

        public SellersController(ISellerRequestsRepo repo, ISellersRepo sellersRepo, IMediator mediator)
        {
            _repo = repo;
            _sellersRepo = sellersRepo;
            _mediator = mediator;
        }

        private string? GetUserId()
            => User.FindFirst("sub")?.Value ?? User.FindFirst("preferred_username")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        public sealed class CreateSellerRequestBody
        {
            public string? UserId { get; set; }
            public string? Email { get; set; }
            public string StoreName { get; set; } = string.Empty;
            public string? Phone { get; set; }
            public string? Description { get; set; }
        }

        [HttpPost("requests")]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateRequest([FromBody] CreateSellerRequestBody body, CancellationToken ct)
        {
            var userId = User.FindFirst("sub")?.Value ?? body.UserId;
            if (string.IsNullOrWhiteSpace(userId))
                return BadRequest(new { message = "userId inválido" });

            var email = User.FindFirst(ClaimTypes.Email)?.Value ?? body.Email ?? string.Empty;
            if (string.IsNullOrWhiteSpace(body.StoreName))
                return BadRequest(new { message = "storeName é obrigatório" });

            var req = new SellerRequest(userId, email, body.StoreName, body.Phone, body.Description);
            var id = await _repo.CreateAsync(req, ct);

            return CreatedAtAction(nameof(ListRequests), new { id }, new { id });
        }

        /// <summary>Retorna a loja do usuário atual (se aprovado como vendedor).</summary>
        [HttpGet("me")]
        [ProducesResponseType(typeof(SellerMeDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMe(CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
            var seller = await _sellersRepo.GetByUserIdAsync(userId, ct);
            if (seller is null) return NotFound();
            return Ok(new SellerMeDto { Id = seller.Id, StoreName = seller.StoreName, Email = seller.Email });
        }

        /// <summary>Lista produtos da loja do vendedor (paginado).</summary>
        [HttpGet("me/products")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ListMyProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
            var seller = await _sellersRepo.GetByUserIdAsync(userId, ct);
            if (seller is null) return StatusCode(403, new { message = "Acesso apenas para lojas credenciadas." });
            var result = await _mediator.Send(new ListProductsBySellerQuery(seller.Id, page, pageSize), ct);
            var items = result.Items.Select(p => new
            {
                id = p.Id,
                name = p.Name,
                description = p.Description,
                price = p.Price,
                stock = p.Stock,
                categoryId = p.CategoryId,
                sellerId = p.SellerId,
                media = p.Media
            });
            return Ok(new { page, pageSize, total = result.Total, items });
        }

        /// <summary>Lista pedidos que contêm produtos da loja do vendedor.</summary>
        [HttpGet("me/orders")]
        [ProducesResponseType(typeof(object[]), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ListMyOrders(CancellationToken ct = default)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
            var list = await _mediator.Send(new ListOrdersForSellerQuery(userId), ct);
            return Ok(list);
        }

        /// <summary>Cria um produto vinculado à loja do vendedor.</summary>
        [HttpPost("me/products")]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequestBody body, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
            var seller = await _sellersRepo.GetByUserIdAsync(userId, ct);
            if (seller is null) return StatusCode(403, new { message = "Acesso apenas para lojas credenciadas." });
            var media = body.Media?.Select(m => new CreateProductMedia(m.Url, m.Type ?? "image")).ToList();
            var cmd = new CreateProductCmd(
                body.Name ?? string.Empty,
                body.Description ?? string.Empty,
                body.Price,
                body.CategoryId ?? string.Empty,
                body.Quantity,
                body.Stock,
                media,
                seller.Id
            );
            var id = await _mediator.Send(cmd, ct);
            return Created($"/api/products/{id}", new { id });
        }

        [HttpGet("requests")]
        [ProducesResponseType(typeof(object[]), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListRequests([FromQuery] string? status, CancellationToken ct)
        {
            var isAdmin = User.IsInRole("admin");
            var userId = isAdmin ? null : User.FindFirst("sub")?.Value;
            if (!isAdmin && string.IsNullOrWhiteSpace(userId))
                return Forbid();

            var items = await _repo.ListAsync(status, userId, ct);
            var result = items.Select(s => new
            {
                id = s.Id,
                userId = s.UserId,
                email = s.Email,
                storeName = s.StoreName,
                phone = s.Phone,
                description = s.Description,
                status = s.Status,
                createdAtUtc = s.CreatedAtUtc,
                updatedAtUtc = s.UpdatedAtUtc
            });
            return Ok(result);
        }

        [Authorize(Roles = "admin")]
        [HttpPost("requests/{id}/approve")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Approve([FromRoute] string id, CancellationToken ct)
        {
            var request = await _repo.GetByIdAsync(id, ct);
            if (request is null)
                return NotFound(new { message = "Solicitação não encontrada." });
            var sellerId = Guid.NewGuid().ToString("N");
            var seller = new Seller(sellerId, request.UserId, request.StoreName, request.Email, request.Phone);
            await _sellersRepo.CreateAsync(seller, ct);
            await _repo.UpdateStatusAsync(id, "approved", ct);
            return NoContent();
        }

        [Authorize(Roles = "admin")]
        [HttpPost("requests/{id}/reject")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Reject([FromRoute] string id, CancellationToken ct)
        {
            await _repo.UpdateStatusAsync(id, "rejected", ct);
            return NoContent();
        }
    }

    public sealed class SellerMeDto
    {
        public string Id { get; set; } = string.Empty;
        public string StoreName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public sealed class CreateProductRequestBody
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? CategoryId { get; set; }
        public int Quantity { get; set; }
        public int Stock { get; set; }
        public List<CreateProductMediaDto>? Media { get; set; }
    }

    public sealed class CreateProductMediaDto
    {
        public string Url { get; set; } = string.Empty;
        public string? Type { get; set; }
    }
}
