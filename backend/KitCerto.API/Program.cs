using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using MediatR;
using KitCerto.Application.Products.Create;
using KitCerto.Infrastructure.DependencyInjection;
using KitCerto.Infrastructure;
using KitCerto.API.Swagger;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGenWithAuthAndProblemDetails(); // nosso extension de Swagger

// Auth (Keycloak) — por enquanto não exigido nos endpoints
var authority = builder.Configuration["Auth:Authority"];
var audience  = builder.Configuration["Auth:Audience"];

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, opt =>
    {
        opt.Authority = authority;
        opt.Audience = audience;
        opt.RequireHttpsMetadata = false; // dev
    });

builder.Services.AddAuthorization();

// MediatR — registra handlers da Application
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreateProductCmd).Assembly));

// Infra (MongoContext + Repo)
builder.Services.AddInfrastructure(builder.Configuration);

// HealthChecks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Swagger UI
app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
