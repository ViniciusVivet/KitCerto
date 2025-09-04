using Microsoft.AspNetCore.Authentication.JwtBearer;
using MediatR;
using Serilog;
using MongoDB.Driver;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

using KitCerto.Application.Products.Create;
using KitCerto.API.Swagger;                 // <- suas extensions de Swagger
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
            // fallback seguro para DEV; não usar em prod
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

// Auth (Keycloak) – valores vêm do appsettings* do ambiente
var authority = builder.Configuration["Auth:Authority"];
var audience  = builder.Configuration["Auth:Audience"];

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.Authority = authority;
        opt.Audience  = audience;
        opt.RequireHttpsMetadata = false; // DEV/Docker
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

app.Run();
