using System;
using System.IO;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using KitCerto.Application.Profile.Queries.GetProfile;
using KitCerto.Application.Profile.Update;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize]
    public sealed class MeController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;

        public MeController(IMediator mediator, IWebHostEnvironment env)
        {
            _mediator = mediator;
            _env = env;
        }

        /// <summary>Retorna perfil do usuário autenticado (dados do token + perfil estendido).</summary>
        [HttpGet]
        [ProducesResponseType(typeof(MeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Get(CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Usuário não autenticado." });

            var profile = await _mediator.Send(new GetProfileQuery(userId), ct);
            var name = User?.FindFirst("name")?.Value ?? User?.FindFirst(ClaimTypes.GivenName)?.Value;
            var email = User?.FindFirst("email")?.Value ?? User?.FindFirst("preferred_username")?.Value;

            var response = new MeResponse
            {
                UserId = userId,
                Name = name,
                Email = email,
                DisplayName = profile?.DisplayName,
                FullName = profile?.FullName,
                Phone = profile?.Phone,
                AvatarUrl = profile?.AvatarUrl,
                BirthDate = profile?.BirthDate,
                Document = profile?.Document,
                NewsletterOptIn = profile?.NewsletterOptIn ?? false,
                UpdatedAtUtc = profile?.UpdatedAtUtc
            };
            return Ok(response);
        }

        /// <summary>Atualiza perfil estendido (foto, nome, telefone, nascimento, CPF, newsletter).</summary>
        [HttpPatch]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Update([FromBody] UpdateMeRequest body, CancellationToken ct)
        {
            var userId = GetUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Usuário não autenticado." });

            DateTime? birthDate = null;
            if (!string.IsNullOrWhiteSpace(body.BirthDate) && DateTime.TryParse(body.BirthDate, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var parsed))
                birthDate = parsed.Date;

            await _mediator.Send(new UpdateProfileCmd(
                userId,
                body.DisplayName,
                body.FullName,
                body.Phone,
                body.AvatarUrl,
                birthDate,
                body.Document,
                body.NewsletterOptIn
            ), ct);
            return NoContent();
        }

        /// <summary>Upload de foto de perfil (qualquer usuário autenticado).</summary>
        [HttpPost("avatar")]
        [RequestSizeLimit(5 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 5 * 1024 * 1024)]
        [ProducesResponseType(typeof(UploadAvatarResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UploadAvatar([FromForm] IFormFile? file, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(GetUserId()))
                return Unauthorized(new { message = "Usuário não autenticado." });
            if (file is null || file.Length == 0)
                return BadRequest(new { message = "Nenhum arquivo enviado." });

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (ext is not (".jpg" or ".jpeg" or ".png" or ".webp" or ".gif"))
                return BadRequest(new { message = "Apenas imagens (jpg, png, webp, gif) são permitidas." });

            var avatarsDir = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "avatars");
            Directory.CreateDirectory(avatarsDir);
            var safeName = $"{Guid.NewGuid():N}{ext}";
            var destPath = Path.Combine(avatarsDir, safeName);
            await using (var stream = System.IO.File.Create(destPath))
            {
                await file.CopyToAsync(stream, ct);
            }
            var url = $"/api/media/avatars/{safeName}";
            return Ok(new UploadAvatarResponse { Url = url });
        }

        private string? GetUserId()
        {
            return User?.FindFirst("preferred_username")?.Value
                ?? User?.FindFirst("sub")?.Value
                ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User?.Identity?.Name;
        }
    }

    public sealed class MeResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? DisplayName { get; set; }
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Document { get; set; }
        public bool NewsletterOptIn { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
    }

    public sealed class UpdateMeRequest
    {
        public string? DisplayName { get; set; }
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        /// <summary>Data de nascimento em formato ISO (yyyy-MM-dd) ou null.</summary>
        public string? BirthDate { get; set; }
        public string? Document { get; set; }
        public bool NewsletterOptIn { get; set; }
    }

    public sealed class UploadAvatarResponse
    {
        public string Url { get; set; } = string.Empty;
    }
}
