using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

using KitCerto.Application.Categories.Create;
using KitCerto.Application.Categories.Queries.ListCategories;
using KitCerto.Application.Categories.Queries.GetCategoryById;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public sealed class CategoriesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CategoriesController(IMediator mediator) => _mediator = mediator;

        /// <summary>Criar uma categoria</summary>
        /// <remarks>
        /// Exemplo de payload:
        /// {
        ///   "name": "Anéis",
        ///   "description": "Categoria para anéis de prata e ouro"
        /// }
        /// </remarks>
        [Authorize(Roles = "admin")]
        [HttpPost]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] CreateCategoryCmd cmd, CancellationToken ct)
        {
            var id = await _mediator.Send(cmd, ct);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }

        /// <summary>Listar categorias (paginação)</summary>
        /// <param name="page">Página atual (default = 1)</param>
        /// <param name="pageSize">Itens por página (default = 20)</param>
        /// <param name="ct">Cancellation token</param>
        [HttpGet]
        [ProducesResponseType(typeof(object[]), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> List(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var data = await _mediator.Send(new ListCategoriesQuery(page, pageSize), ct);
            return Ok(new
            {
                page,
                pageSize,
                total = data.Count,
                items = data
            });
        }

        /// <summary>Obter categoria por ID</summary>
        /// <param name="id">Identificador único da categoria</param>
        /// <param name="ct">Cancellation token</param>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById([FromRoute] string id, CancellationToken ct)
        {
            var cat = await _mediator.Send(new GetCategoryByIdQuery(id), ct);
            if (cat is null)
                return NotFound(new { message = "Categoria não encontrada", id });

            return Ok(new
            {
                id = cat.Id,
                name = cat.Name,
                description = cat.Description
            });
        }
    }
}
