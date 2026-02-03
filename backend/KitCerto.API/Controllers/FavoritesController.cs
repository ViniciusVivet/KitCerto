using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using KitCerto.Application.Favorites.Queries.ListFavorites;
using KitCerto.Application.Favorites.Add;
using KitCerto.Application.Favorites.Remove;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize]
    public sealed class FavoritesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FavoritesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(typeof(FavoriteItemDto[]), StatusCodes.Status200OK)]
        public async Task<IActionResult> List(CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            var list = await _mediator.Send(new ListFavoritesQuery(userId), ct);
            return Ok(list);
        }

        [HttpPost("{productId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Add([FromRoute] string productId, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            if (string.IsNullOrWhiteSpace(productId)) return BadRequest(new { message = "ProductId obrigatório." });
            await _mediator.Send(new AddFavoriteCmd(userId, productId), ct);
            return NoContent();
        }

        [HttpDelete("{productId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Remove([FromRoute] string productId, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Usuário não autenticado." });
            await _mediator.Send(new RemoveFavoriteCmd(userId, productId), ct);
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
}
