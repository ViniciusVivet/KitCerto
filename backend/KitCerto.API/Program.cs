using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using System.Linq;                 // ✅ LINQ usado no /whoami e no mapeamento
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

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers()
    .AddApplicationPart(typeof(Program).Assembly);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGenWithAuthAndProblemDetails(builder.Configuration);

// CORS (origens lidas do appsettings: Cors:Origins)
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
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

            // ✅ audience validado para segurança
            ValidateAudience = true,
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
                if (ctx.SecurityToken is JwtSecurityToken jwt)
                {
                    var identity = ctx.Principal?.Identities.FirstOrDefault();
                    if (identity is null) return Task.CompletedTask;

                    // -------- roles em realm_access.roles
                    if (jwt.Payload.TryGetValue("realm_access", out var realmAccessObj))
                    {
                        try
                        {
                            using var doc = JsonDocument.Parse(realmAccessObj.ToString()!);
                            if (doc.RootElement.TryGetProperty("roles", out var rolesEl) &&
                                rolesEl.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var r in rolesEl.EnumerateArray())
                                {
                                    var role = r.GetString();
                                    if (!string.IsNullOrWhiteSpace(role))
                                        identity.AddClaim(new Claim(ClaimTypes.Role, role!));
                                }
                            }
                        }
                        catch { /* ignora parsing em DEV */ }
                    }

                    // -------- roles em resource_access.{clientId}.roles
                    if (jwt.Payload.TryGetValue("resource_access", out var resourceAccessObj))
                    {
                        try
                        {
                            using var doc = JsonDocument.Parse(resourceAccessObj.ToString()!);
                            if (doc.RootElement.TryGetProperty(audience, out var clientEl) &&
                                clientEl.TryGetProperty("roles", out var clientRoles) &&
                                clientRoles.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var r in clientRoles.EnumerateArray())
                                {
                                    var role = r.GetString();
                                    if (!string.IsNullOrWhiteSpace(role))
                                        identity.AddClaim(new Claim(ClaimTypes.Role, role!));
                                }
                            }
                        }
                        catch { /* ignora parsing em DEV */ }
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
    cfg.RegisterServicesFromAssembly(typeof(CreateProductCmd).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DashboardOverviewQuery).Assembly);
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
