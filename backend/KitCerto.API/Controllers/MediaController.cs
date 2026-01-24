using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public sealed class MediaController : ControllerBase
    {
        private readonly IHostEnvironment _env;

        public MediaController(IHostEnvironment env)
        {
            _env = env;
        }

        public sealed record MediaUploadResult(string Url, string Type, string FileName);

        [Authorize(Roles = "admin")]
        [HttpPost("upload")]
        [RequestSizeLimit(200 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 200 * 1024 * 1024)]
        [ProducesResponseType(typeof(MediaUploadResult[]), StatusCodes.Status200OK)]
        public async Task<IActionResult> Upload([FromForm] List<IFormFile> files, CancellationToken ct)
        {
            if (files is null || files.Count == 0)
                return BadRequest(new { message = "Nenhum arquivo enviado." });

            var uploadsRoot = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsRoot);

            var results = new List<MediaUploadResult>();
            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                var isImage = ext is ".jpg" or ".jpeg" or ".png" or ".webp" or ".gif";
                var isVideo = ext is ".mp4" or ".webm" or ".mov";
                if (!isImage && !isVideo)
                    return BadRequest(new { message = $"Tipo de arquivo não permitido: {file.FileName}" });

                var safeName = $"{Guid.NewGuid():N}{ext}";
                var destPath = Path.Combine(uploadsRoot, safeName);

                await using (var stream = System.IO.File.Create(destPath))
                {
                    await file.CopyToAsync(stream, ct);
                }

                var url = $"/api/media/{safeName}";
                results.Add(new MediaUploadResult(url, isVideo ? "video" : "image", safeName));
            }

            return Ok(results);
        }
    }
}
