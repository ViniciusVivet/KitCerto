using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;

using KitCerto.Application.Products.Queries.SearchProducts;
using KitCerto.Application.Products.Create;
using KitCerto.Application.Products.Queries.ListProducts;
using KitCerto.Application.Products.Queries.GetProductById;
using KitCerto.Application.Products.Update;
using KitCerto.Application.Products.Delete;
using KitCerto.Application.Products.Stock;
using KitCerto.Application.Products.Queries.ListLowStock;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/products")]
    [Produces("application/json")]
    public sealed class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ISellersRepo _sellersRepo;

        public ProductsController(IMediator mediator, ISellersRepo sellersRepo)
        {
            _mediator = mediator;
            _sellersRepo = sellersRepo;
        }

        private string? GetUserId()
            => User?.FindFirst("sub")?.Value ?? User?.FindFirst("preferred_username")?.Value ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        /// <summary>Criar um produto</summary>
        [Authorize(Roles = "admin")]
        [HttpPost]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] CreateProductCmd cmd, CancellationToken ct)
        {
            var id = await _mediator.Send(cmd, ct);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }

        /// <summary>Listar produtos (com paginação)</summary>
        [HttpGet]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> List(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var data = await _mediator.Send(new ListProductsQuery(page, pageSize), ct);
            return Ok(new
            {
                page,
                pageSize,
                total = data.Count,
                items = data
            });
        }

        /// <summary>Obter produto por ID</summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById([FromRoute] string id, CancellationToken ct)
        {
            var prod = await _mediator.Send(new GetProductByIdQuery(id), ct);
            if (prod is null)
                return NotFound(new { message = "Produto não encontrado", id });

            return Ok(new
            {
                id = prod.Id,
                name = prod.Name,
                description = prod.Description,
                price = prod.Price,
                stock = prod.Stock,
                categoryId = prod.CategoryId,
                media = prod.Media
            });
        }

        /// <summary>Atualizar um produto (admin ou dono do produto se seller).</summary>
        [Authorize]
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateProductCmd cmd, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
            var seller = await _sellersRepo.GetByUserIdAsync(userId, ct);
            cmd.Id = id;
            cmd.SellerIdForAuth = User.IsInRole("admin") ? null : seller?.Id;
            if (!User.IsInRole("admin") && seller is null) return StatusCode(403, new { message = "Acesso negado." });
            try
            {
                await _mediator.Send(cmd, ct);
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return StatusCode(403, new { message = "Produto não pertence à sua loja." }); }
        }

        /// <summary>Excluir um produto (admin ou dono do produto se seller).</summary>
        [Authorize]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
            var seller = await _sellersRepo.GetByUserIdAsync(userId, ct);
            var sellerIdForAuth = User.IsInRole("admin") ? null : seller?.Id;
            if (!User.IsInRole("admin") && seller is null) return StatusCode(403, new { message = "Acesso negado." });
            try
            {
                await _mediator.Send(new DeleteProductCmd(id, sellerIdForAuth), ct);
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return StatusCode(403, new { message = "Produto não pertence à sua loja." }); }
        }

        /// <summary>Atualizar apenas o estoque (admin ou dono do produto se seller).</summary>
        [Authorize]
        [HttpPatch("{id}/stock")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateStock([FromRoute] string id, [FromBody] UpdateProductStockCmd body, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
            var seller = await _sellersRepo.GetByUserIdAsync(userId, ct);
            var sellerIdForAuth = User.IsInRole("admin") ? null : seller?.Id;
            if (!User.IsInRole("admin") && seller is null) return StatusCode(403, new { message = "Acesso negado." });
            try
            {
                var cmd = body with { Id = id, SellerIdForAuth = sellerIdForAuth };
                await _mediator.Send(cmd, ct);
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return StatusCode(403, new { message = "Produto não pertence à sua loja." }); }
        }

        /// <summary>Listar produtos com estoque abaixo do limite</summary>
        [HttpGet("low-stock")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> LowStock([FromQuery] int threshold = 10, CancellationToken ct = default)
        {
            var items = await _mediator.Send(new ListLowStockProductsQuery(threshold), ct);
            return Ok(new { threshold, count = items.Count, items });
        }

        /// <summary>Buscar produtos por nome e/ou categoria (paginado)</summary>
        [HttpGet("search")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Search(
            [FromQuery] string? name,
            [FromQuery] string? categoryId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new SearchProductsQuery(page, pageSize, name, categoryId), ct);
            return Ok(new
            {
                page = result.Page,
                pageSize = result.PageSize,
                total = result.Total,
                items = result.Items
            });
        }
    }
}
