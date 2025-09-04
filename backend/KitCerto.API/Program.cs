using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;

using MediatR;
using Serilog;
using MongoDB.Driver;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

using KitCerto.Application.Products.Create;
using KitCerto.API.Swagger;                 // suas extensions de Swagger
using KitCerto.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGenWithAuthAndProblemDetails(builder.Configuration);

// CORS (origens lidas do appsettings: Cors:Origins)
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
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
            // fallback DEV; não usar em prod
            policy.AllowAnyHeader().AllowAnyMethod();
        }
    });
});

// Rate limiting simples
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.PermitLimit = 100;                 // até 100 req
        opt.Window = TimeSpan.FromMinutes(1);  // por minuto
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 20;                   // fila extra
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
        options.Authority = authority;                // ex.: http://localhost:8080/realms/kitcerto
        options.RequireHttpsMetadata = false;         // DEV/Docker
        options.MapInboundClaims = false;             // manter nomes "crus" de claims

        // O discovery do OIDC já é resolvido via Authority.
        // Não setar MetadataAddress manualmente.

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = authority,

            // 🔑 aceitar múltiplos audiences: o Keycloak muitas vezes inclui "account"
            ValidateAudience = false,
            ValidAudiences = new[] { audience, "account" },

            NameClaimType = "preferred_username",
            RoleClaimType = ClaimTypes.Role,
            ClockSkew = TimeSpan.FromSeconds(5)
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = ctx =>
            {
                if (ctx.SecurityToken is JwtSecurityToken jwt)
                {
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
                                        ctx.Principal?.Identities.First().AddClaim(new Claim(ClaimTypes.Role, role!));
                                }
                            }
                        }
                        catch { /* ignora parsing */ }
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
                                        ctx.Principal?.Identities.First().AddClaim(new Claim(ClaimTypes.Role, role!));
                                }
                            }
                        }
                        catch { /* ignora parsing */ }
                    }
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// MediatR (Application)
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreateProductCmd).Assembly));

// Infra (Mongo + Repositórios)
builder.Services.AddInfrastructure(builder.Configuration);

// HealthChecks (Mongo)
var cs = builder.Configuration.GetConnectionString("Mongo")
         ?? throw new InvalidOperationException("Missing connection string 'Mongo'");
builder.Services.AddHealthChecks()
    .AddMongoDb(sp => new MongoClient(cs), name: "mongo");

// Serilog
builder.Host.UseSerilog((ctx, lc) =>
{
    lc.ReadFrom.Configuration(ctx.Configuration)
      .Enrich.FromLogContext()
      .WriteTo.Console();
});

var app = builder.Build();

app.UseSerilogRequestLogging();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.MapHealthChecks("/health");
app.MapControllers().RequireRateLimiting("fixed");

// Endpoint de fumaça rápido (pode remover depois)
app.MapGet("/whoami", (ClaimsPrincipal user) => new
{
    name = user.Identity?.Name,
    roles = user.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToArray()
}).RequireAuthorization();

app.Run();
