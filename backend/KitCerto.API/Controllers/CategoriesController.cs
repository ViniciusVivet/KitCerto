using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

using KitCerto.Application.Categories.Create;
using KitCerto.Application.Categories.Queries.ListCategories;
using KitCerto.Application.Categories.Queries.GetCategoryById;
using KitCerto.Application.Categories.Update;
using KitCerto.Application.Categories.Delete;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/categories")]
    [Produces("application/json")]
    public sealed class CategoriesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CategoriesController(IMediator mediator) => _mediator = mediator;

        /// <summary>Criar uma categoria</summary>
        [Authorize(Roles = "admin")]
        [HttpPost]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        public async Task<IActionResult> Create([FromBody] CreateCategoryCmd cmd, CancellationToken ct)
        {
            var id = await _mediator.Send(cmd, ct);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }

        /// <summary>Listar categorias (paginação)</summary>
        [HttpGet]
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
        [HttpGet("{id}")]
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

        /// <summary>Atualizar uma categoria</summary>
        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateCategoryCmd body, CancellationToken ct)
        {
            var cmd = body with { Id = id };
            await _mediator.Send(cmd, ct);
            return NoContent();
        }

        /// <summary>Excluir uma categoria</summary>
        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken ct)
        {
            await _mediator.Send(new DeleteCategoryCmd(id), ct);
            return NoContent();
        }
    }
}
