using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class AuthController : ControllerBase
    {
        [Authorize]
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value });
            return Ok(new { authenticated = User.Identity?.IsAuthenticated ?? false, claims });
        }
    }
}
