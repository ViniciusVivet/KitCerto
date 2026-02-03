using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Application.Settings.Queries.GetSettings;
using KitCerto.Application.Settings.Update;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/settings")]
    [Produces("application/json")]
    public sealed class SettingsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public SettingsController(IMediator mediator) => _mediator = mediator;

        [HttpGet]
        public async Task<IActionResult> Get(CancellationToken ct)
        {
            var settings = await _mediator.Send(new GetSettingsQuery(), ct);
            return Ok(settings);
        }

        [Authorize(Roles = "admin")]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateSettingsCmd cmd, CancellationToken ct)
        {
            await _mediator.Send(cmd, ct);
            return NoContent();
        }
    }
}
