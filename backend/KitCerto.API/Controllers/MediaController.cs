using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace KitCerto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public sealed class MediaController : ControllerBase
    {
        private readonly IHostEnvironment _env;
        private readonly IConfiguration _cfg;

        public MediaController(IHostEnvironment env, IConfiguration cfg)
        {
            _env = env;
            _cfg = cfg;
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

            var provider = _cfg["Storage:Provider"] ?? "local";
            var s3Bucket = _cfg["Storage:S3:Bucket"];
            var s3Region = _cfg["Storage:S3:Region"] ?? _cfg["AWS:Region"] ?? Environment.GetEnvironmentVariable("AWS_REGION");
            var s3BaseUrl = _cfg["Storage:S3:BaseUrl"];
            var s3PublicRead = _cfg.GetValue<bool?>("Storage:S3:PublicRead") ?? true;
            var useS3 = provider.Equals("s3", StringComparison.OrdinalIgnoreCase) || !string.IsNullOrWhiteSpace(s3Bucket);

            var uploadsRoot = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
            if (!useS3)
            {
                Directory.CreateDirectory(uploadsRoot);
            }

            var results = new List<MediaUploadResult>();
            var imageCount = 0;
            var videoCount = 0;
            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                var isImage = ext is ".jpg" or ".jpeg" or ".png" or ".webp" or ".gif";
                var isVideo = ext is ".mp4" or ".webm" or ".mov";
                if (!isImage && !isVideo)
                    return BadRequest(new { message = $"Tipo de arquivo não permitido: {file.FileName}" });
                if (isImage) imageCount++;
                if (isVideo) videoCount++;
            }
            if (imageCount > 5 || videoCount > 2 || (imageCount + videoCount) > 7)
                return BadRequest(new { message = "Limite por produto: até 5 fotos e 2 vídeos." });

            IAmazonS3? s3 = null;
            if (useS3)
            {
                if (string.IsNullOrWhiteSpace(s3Bucket))
                    return BadRequest(new { message = "S3 não configurado: Storage:S3:Bucket ausente." });
                if (string.IsNullOrWhiteSpace(s3Region))
                    return BadRequest(new { message = "S3 não configurado: Storage:S3:Region ausente." });

                var accessKey = _cfg["AWS:AccessKeyId"] ?? Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");
                var secretKey = _cfg["AWS:SecretAccessKey"] ?? Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");
                var region = RegionEndpoint.GetBySystemName(s3Region);
                s3 = string.IsNullOrWhiteSpace(accessKey) || string.IsNullOrWhiteSpace(secretKey)
                    ? new AmazonS3Client(region)
                    : new AmazonS3Client(new BasicAWSCredentials(accessKey, secretKey), region);

                if (string.IsNullOrWhiteSpace(s3BaseUrl))
                {
                    s3BaseUrl = s3Region == "us-east-1"
                        ? $"https://{s3Bucket}.s3.amazonaws.com"
                        : $"https://{s3Bucket}.s3.{s3Region}.amazonaws.com";
                }
            }

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                var isVideo = ext is ".mp4" or ".webm" or ".mov";
                var safeName = $"{Guid.NewGuid():N}{ext}";
                if (useS3)
                {
                    var key = $"uploads/{safeName}";
                    await using var stream = file.OpenReadStream();
                    var put = new PutObjectRequest
                    {
                        BucketName = s3Bucket,
                        Key = key,
                        InputStream = stream,
                        ContentType = file.ContentType
                    };
                    if (s3PublicRead)
                        put.CannedACL = S3CannedACL.PublicRead;

                    await s3!.PutObjectAsync(put, ct);
                    var url = $"{s3BaseUrl!.TrimEnd('/')}/{key}";
                    results.Add(new MediaUploadResult(url, isVideo ? "video" : "image", safeName));
                }
                else
                {
                    var destPath = Path.Combine(uploadsRoot, safeName);
                    await using (var stream = System.IO.File.Create(destPath))
                    {
                        await file.CopyToAsync(stream, ct);
                    }

                    var url = $"/api/media/{safeName}";
                    results.Add(new MediaUploadResult(url, isVideo ? "video" : "image", safeName));
                }
            }

            return Ok(results);
        }
    }
}
