using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

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
    [Route("api/[controller]")]
    [Produces("application/json")]
    public sealed class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ProductsController(IMediator mediator) => _mediator = mediator;

        /// <summary>Criar um produto</summary>
        /// <remarks>
        /// Exemplo:
        /// {
        ///   "name":"Colar de ouro",
        ///   "description":"Colar 18k com pingente",
        ///   "price":1200.50,
        ///   "stock":10,
        ///   "categoryId":"bijouterias"
        /// }
        /// </remarks>
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
                total = data.Count, // <- propriedade, sem precisar de System.Linq
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
                categoryId = prod.CategoryId
            });
        }

        /// <summary>Atualizar um produto</summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateProductCmd body, CancellationToken ct)
        {
            var cmd = body with { Id = id };
            await _mediator.Send(cmd, ct);
            return NoContent();
        }

        /// <summary>Excluir um produto</summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken ct)
        {
            await _mediator.Send(new DeleteProductCmd(id), ct);
            return NoContent();
        }

        /// <summary>Atualizar apenas o estoque</summary>
        [HttpPatch("{id}/stock")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateStock([FromRoute] string id, [FromBody] UpdateProductStockCmd body, CancellationToken ct)
        {
            var cmd = body with { Id = id };
            await _mediator.Send(cmd, ct);
            return NoContent();
        }

        /// <summary>Listar produtos com estoque abaixo do limite</summary>
        [HttpGet("low-stock")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> LowStock([FromQuery] int threshold = 10, CancellationToken ct = default)
        {
            var items = await _mediator.Send(new ListLowStockProductsQuery(threshold), ct);
            return Ok(new { threshold, count = items.Count, items });
        }
    }
}
