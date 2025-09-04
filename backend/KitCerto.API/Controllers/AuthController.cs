using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        [HttpGet("ping")]
        [Authorize] // qualquer usuário autenticado
        public IActionResult Ping()
        {
            var name = User.Identity?.Name ?? "(sem name)";
            var roles = User.Claims
                            .Where(c => c.Type.EndsWith("role"))
                            .Select(c => c.Value)
                            .ToArray();

            return Ok(new
            {
                ok = true,
                user = name,
                roles
            });
        }
    }
}
