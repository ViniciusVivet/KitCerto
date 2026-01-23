using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using KitCerto.Domain.Sellers;
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

        public SellersController(ISellerRequestsRepo repo)
        {
            _repo = repo;
        }

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
}
