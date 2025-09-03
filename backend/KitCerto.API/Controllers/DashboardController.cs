using System.Threading;
using System.Threading.Tasks;
using KitCerto.Application.Dashboard.Overview;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public sealed class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;
        public DashboardController(IMediator mediator) => _mediator = mediator;

        /// <summary>
        /// Visão geral do dashboard (totais e agregações)
        /// </summary>
        [HttpGet("overview")]
        [ProducesResponseType(typeof(DashboardOverviewDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> Overview(CancellationToken ct)
        {
            var dto = await _mediator.Send(new DashboardOverviewQuery(), ct);
            return Ok(dto);
        }
    }
}
