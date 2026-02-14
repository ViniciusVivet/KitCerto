using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.JsonWebTokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using System.Collections.Generic;
using System.Linq;                 // ✅ LINQ usado no /whoami e no mapeamento
using System.IO;
using System.Threading.Tasks;      // ✅ Task usado no OnTokenValidated

using MediatR;
using Serilog;
using MongoDB.Driver;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

using KitCerto.Application.Products.Create;
using KitCerto.API.Swagger;
using KitCerto.Infrastructure.DependencyInjection;
using KitCerto.API.Middlewares;
using KitCerto.Application.Dashboard.Overview;
using KitCerto.Application.Products.Queries.ListProducts;
using KitCerto.Application.Categories.Queries.ListCategories;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers()
    .AddApplicationPart(typeof(Program).Assembly)
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGenWithAuthAndProblemDetails(builder.Configuration);

// CORS (origens lidas do appsettings: Cors:Origins - array ou string separada por ; ou ,)
var corsSection = builder.Configuration.GetSection("Cors:Origins");
var corsOrigins = corsSection.Get<string[]>();
if (corsOrigins is null || corsOrigins.Length == 0)
{
    var corsStr = builder.Configuration["Cors:Origins"];
    corsOrigins = string.IsNullOrWhiteSpace(corsStr)
        ? Array.Empty<string>()
        : corsStr.Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries)
                 .Select(s => s.Trim())
                 .Where(s => s.Length > 0)
                 .ToArray();
}
if (corsOrigins.Length == 0 && !builder.Environment.IsDevelopment())
{
    throw new InvalidOperationException("Cors:Origins deve ser configurado fora de Development.");
}
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (corsOrigins.Length > 0)
        {
            policy.WithOrigins(corsOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            // fallback DEV
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

// Rate limiting simples
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", opt =>
    {
        opt.PermitLimit = 100;                 // até 100 req/min
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 20;
    });

    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.PermitLimit = 30;                  // endpoints sensíveis
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 10;
    });

    options.AddFixedWindowLimiter("health", opt =>
    {
        opt.PermitLimit = 300;                 // checks mais frequentes
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
});

// ===================
// JWT / Keycloak
// ===================
var isLocalEnv = builder.Environment.IsDevelopment()
    || builder.Environment.EnvironmentName.Equals("Docker", StringComparison.OrdinalIgnoreCase);
var authorityRaw = builder.Configuration["Auth:Authority"]
    ?? throw new InvalidOperationException("Auth:Authority not set");
var audience = builder.Configuration["Auth:Audience"]
    ?? throw new InvalidOperationException("Auth:Audience not set");

// normaliza (sem barra no final)
var authority = authorityRaw.TrimEnd('/');

// IMPORTANTÍSSIMO: não remapear claims automaticamente
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = authority;                // ex.: o http://keycloak:8080/realms/kitcerto
        var requireHttpsMetadata = builder.Configuration.GetValue<bool?>("Auth:RequireHttpsMetadata");
        options.RequireHttpsMetadata = requireHttpsMetadata ?? !builder.Environment.IsDevelopment();
        options.MapInboundClaims = false;             // manter nomes "crus" de claims

        options.TokenValidationParameters = new TokenValidationParameters
        {
            // ✅ aceitar os dois emissores em DEV
            ValidateIssuer = true,
            ValidIssuers = new[]
            {
                "http://localhost:8080/realms/kitcerto",
                "http://keycloak:8080/realms/kitcerto"
            },

            // Em ambiente local, aceita tokens sem aud para facilitar o fluxo.
            ValidateAudience = !isLocalEnv,
            ValidAudiences = new[] { audience, "account" },

            NameClaimType = "preferred_username",
            RoleClaimType = ClaimTypes.Role,
            ClockSkew = TimeSpan.FromSeconds(5)
        };

        // ✅ mapeia roles do Keycloak para ClaimTypes.Role (ex.: "admin", "user")
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = ctx =>
            {
                {
                    var identity = ctx.Principal?.Identities.FirstOrDefault();
                    var roles = new List<string>();

                    string? realmAccessRaw = null;
                    string? resourceAccessRaw = null;

                    if (ctx.SecurityToken is JwtSecurityToken jwt)
                    {
                        if (jwt.Payload.TryGetValue("realm_access", out var realmAccessObj))
                            realmAccessRaw = realmAccessObj?.ToString();
                        if (jwt.Payload.TryGetValue("resource_access", out var resourceAccessObj))
                            resourceAccessRaw = resourceAccessObj?.ToString();
                    }
                    else if (ctx.SecurityToken is JsonWebToken jwt2)
                    {
                        if (jwt2.TryGetPayloadValue("realm_access", out string? ra))
                            realmAccessRaw = ra;
                        if (jwt2.TryGetPayloadValue("resource_access", out string? rca))
                            resourceAccessRaw = rca;
                    }

                    if (string.IsNullOrWhiteSpace(realmAccessRaw))
                        realmAccessRaw = ctx.Principal?.FindFirst("realm_access")?.Value;
                    if (string.IsNullOrWhiteSpace(resourceAccessRaw))
                        resourceAccessRaw = ctx.Principal?.FindFirst("resource_access")?.Value;

                    if (!string.IsNullOrWhiteSpace(realmAccessRaw))
                    {
                        try
                        {
                            using var doc = JsonDocument.Parse(realmAccessRaw);
                            if (doc.RootElement.TryGetProperty("roles", out var rolesEl) &&
                                rolesEl.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var r in rolesEl.EnumerateArray())
                                {
                                    var role = r.GetString();
                                    if (!string.IsNullOrWhiteSpace(role))
                                        roles.Add(role!);
                                }
                            }
                        }
                        catch { /* ignora parsing em DEV */ }
                    }

                    if (!string.IsNullOrWhiteSpace(resourceAccessRaw))
                    {
                        try
                        {
                            using var doc = JsonDocument.Parse(resourceAccessRaw);
                            if (doc.RootElement.TryGetProperty(audience, out var clientEl) &&
                                clientEl.TryGetProperty("roles", out var clientRoles) &&
                                clientRoles.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var r in clientRoles.EnumerateArray())
                                {
                                    var role = r.GetString();
                                    if (!string.IsNullOrWhiteSpace(role))
                                        roles.Add(role!);
                                }
                            }
                        }
                        catch { /* ignora parsing em DEV */ }
                    }

                    if (roles.Count > 0)
                    {
                        if (identity is null)
                        {
                            var roleClaims = roles.Distinct().Select(r => new Claim(ClaimTypes.Role, r));
                            ctx.Principal?.AddIdentity(new ClaimsIdentity(roleClaims, ctx.Principal?.Identity?.AuthenticationType, null, ClaimTypes.Role));
                        }
                        else
                        {
                            foreach (var r in roles.Distinct())
                            {
                                if (!identity.HasClaim(ClaimTypes.Role, r))
                                    identity.AddClaim(new Claim(ClaimTypes.Role, r));
                            }
                        }
                    }
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// MediatR (Application + Dashboard handlers)
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(KitCerto.Application.Products.Create.CreateProductCmd).Assembly);
});

// Infra (Mongo + Repositórios)
builder.Services.AddInfrastructure(builder.Configuration);

// HealthChecks simples (sem package específico)
builder.Services.AddHealthChecks();
builder.Services.AddMemoryCache();

// Serilog
builder.Host.UseSerilog((ctx, lc) =>
{
    lc.ReadFrom.Configuration(ctx.Configuration)
      .Enrich.FromLogContext()
      .WriteTo.Console();
});

var app = builder.Build();

app.UseSerilogRequestLogging();

app.UseMiddleware<ProblemDetailsMiddleware>();

app.UseSwaggerDocumentation(builder.Configuration);

var uploadsRoot = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");
Directory.CreateDirectory(uploadsRoot);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsRoot),
    RequestPath = "/api/media"
});

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.MapHealthChecks("/health").RequireRateLimiting("health");
app.MapControllers().RequireRateLimiting("api");

// Endpoint de fumaça rápido
app.MapGet("/whoami", (ClaimsPrincipal user) => new
{
    name = user.Identity?.Name,
    roles = user.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToArray()
}).RequireAuthorization()
  .RequireRateLimiting("auth");

app.Run();
