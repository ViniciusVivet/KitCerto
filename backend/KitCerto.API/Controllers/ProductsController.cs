using Microsoft.AspNetCore.Mvc;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Application.Products.Create;
using KitCerto.Application.Products.Queries.ListProducts;
using KitCerto.Application.Products.Queries.GetProductById;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public sealed class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ProductsController(IMediator mediator) => _mediator = mediator;

        /// <summary>
        /// Criar um produto
        /// </summary>
        /// <remarks>
        /// Exemplo de request:
        ///
        ///     POST /api/Products
        ///     {
        ///        "name": "Colar de ouro",
        ///        "description": "Colar 18k com pingente",
        ///        "price": 1200.50,
        ///        "stock": 10,
        ///        "categoryId": "bijouterias"
        ///     }
        ///
        /// </remarks>
        /// <param name="cmd">Dados do produto a ser criado.</param>
        /// <param name="ct">Token de cancelamento da requisição.</param>
        /// <response code="201">Retorna o ID do produto criado</response>
        /// <response code="400">Erro de validação</response>
        /// <response code="500">Erro interno</response>

                [HttpPost]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] CreateProductCmd cmd, CancellationToken ct)
        {
            var id = await _mediator.Send(cmd, ct);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }

        /// <summary>
        /// Listar produtos (com paginação)
        /// </summary>
        /// <param name="page">Página atual (default = 1)</param>
        /// <param name="pageSize">Itens por página (default = 20)</param>
        /// <param name="ct">Token de cancelamento da requisição.</param>
        /// <response code="200">Retorna a lista de produtos</response>
        /// <response code="500">Erro interno</response>


        [HttpGet]
        [ProducesResponseType(typeof(object[]), StatusCodes.Status200OK)]
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
                total = data.Count(),
                items = data
            });
        }

        /// <summary>
        /// Obter produto por ID
        /// </summary>
        /// <param name="id">Identificador único do produto</param>
        /// <param name="ct">Token de cancelamento da requisição.</param>
        /// <response code="200">Retorna os detalhes do produto</response>
        /// <response code="404">Produto não encontrado</response>
        /// <response code="500">Erro interno</response>

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
    }
}
