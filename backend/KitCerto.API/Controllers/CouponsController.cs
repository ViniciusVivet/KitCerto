using System.Linq;
using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using KitCerto.Application.Coupons.Queries.ListActiveCoupons;
using KitCerto.Application.Coupons.Create;
using KitCerto.Domain.Coupons;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public sealed class CouponsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CouponsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>Lista cupons ativos (válidos e dentro do limite de uso).</summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(CouponDto[]), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListActive(CancellationToken ct)
        {
            var list = await _mediator.Send(new ListActiveCouponsQuery(), ct);
            var dtos = list.Select(c => new CouponDto
            {
                Id = c.Id,
                Code = c.Code,
                Description = c.Description,
                DiscountType = c.DiscountType,
                DiscountValue = c.DiscountValue,
                MinOrderValue = c.MinOrderValue,
                ValidFrom = c.ValidFrom,
                ValidUntil = c.ValidUntil,
                MaxUses = c.MaxUses,
                UsedCount = c.UsedCount
            }).ToArray();
            return Ok(dtos);
        }

        /// <summary>Cria cupom (admin).</summary>
        [HttpPost]
        [Authorize(Roles = "admin")]
        [ProducesResponseType(typeof(CreateCouponResult), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateCouponRequest body, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(body?.Code))
                return BadRequest(new { message = "Código é obrigatório." });
            try
            {
                var id = await _mediator.Send(new CreateCouponCmd(
                    body.Code.Trim().ToUpperInvariant(),
                    body.Description?.Trim(),
                    body.DiscountType ?? "percent",
                    body.DiscountValue,
                    body.MinOrderValue,
                    body.ValidFrom,
                    body.ValidUntil,
                    body.MaxUses
                ), ct);
                return StatusCode(StatusCodes.Status201Created, new CreateCouponResult { Id = id });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public sealed class CreateCouponRequest
    {
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? DiscountType { get; set; } = "percent";
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public int MaxUses { get; set; }
    }

    public sealed class CreateCouponResult
    {
        public string Id { get; set; } = string.Empty;
    }

    public sealed class CouponDto
    {
        public string Id { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = "percent";
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public System.DateTime ValidFrom { get; set; }
        public System.DateTime ValidUntil { get; set; }
        public int MaxUses { get; set; }
        public int UsedCount { get; set; }
    }
}
