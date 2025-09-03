using Microsoft.AspNetCore.Authentication.JwtBearer;
using MediatR;
using KitCerto.Application.Products.Create;
using KitCerto.Infrastructure;
using KitCerto.API.Swagger; // <— extensões do Swagger (nos arquivos que criamos)

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger (modular)
builder.Services.AddSwaggerDocs();

// Auth (Keycloak)
var authority = builder.Configuration["Auth:Authority"];
var audience  = builder.Configuration["Auth:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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

// Infrastructure (MongoContext + Repo)
builder.Services.AddInfrastructure(builder.Configuration);

// HealthChecks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Swagger (modular)
app.UseSwaggerDocs();

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
