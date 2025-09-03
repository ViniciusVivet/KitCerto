// backend/KitCerto.API/Swagger/SwaggerServiceExtensions.cs
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace KitCerto.API.Swagger;

public static class SwaggerServiceExtensions
{
    public static IServiceCollection AddSwaggerDocs(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();

        services.AddSwaggerGen(c =>
        {
            // Doc geral
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "KitCerto API",
                Version = "v1",
                Description = "Plataforma de e-commerce da KitCerto (Clean Architecture + CQRS + Keycloak + MongoDB)"
            });

            // Doc por área (ex.: Products)
            c.SwaggerDoc("products", new OpenApiInfo
            {
                Title = "KitCerto API - Products",
                Version = "v1",
                Description = "Operações de Catálogo (Produtos/Categorias)"
            });

            // JWT Bearer
            var scheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Envie o token no formato: Bearer {seu_token_jwt}"
            };

            c.AddSecurityDefinition("Bearer", scheme);
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                { scheme, Array.Empty<string>() }
            });

            // XML comments (para summaries aparecerem no Swagger)
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
                c.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);

            // Predicado para separar docs por área via GroupName (ver passo 3)
            c.DocInclusionPredicate((docName, apiDesc) =>
            {
                var group = apiDesc.GroupName ?? "v1";
                if (docName.Equals("v1", StringComparison.OrdinalIgnoreCase))
                    return true; // v1 mostra tudo

                return group.Equals(docName, StringComparison.OrdinalIgnoreCase);
            });
        });

        return services;
    }
}
