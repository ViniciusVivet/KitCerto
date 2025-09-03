using Microsoft.AspNetCore.Authentication.JwtBearer;
using MediatR;
using Serilog;
using MongoDB.Driver;

using KitCerto.Application.Products.Create;
using KitCerto.API.Swagger;
using KitCerto.Infrastructure.DependencyInjection;
using HealthChecks.MongoDb; // <- necessário para AddMongoDb

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGenWithAuthAndProblemDetails();

// Auth (Keycloak) – configurado mas não obrigatório nos endpoints
var authority = builder.Configuration["Auth:Authority"];
var audience  = builder.Configuration["Auth:Audience"];

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.Authority = authority;
        opt.Audience  = audience;
        opt.RequireHttpsMetadata = false; // dev
    });

builder.Services.AddAuthorization();

// MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreateProductCmd).Assembly));

// Infra (MongoContext + Repos)
builder.Services.AddInfrastructure(builder.Configuration);

// HealthChecks (Mongo) — APENAS health check aqui
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

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
