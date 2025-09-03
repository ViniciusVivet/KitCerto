using System;
using KitCerto.API.Swagger.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace KitCerto.API.Swagger
{
    public static class SwaggerServiceExtensions
    {
        /// <summary>
        /// Registra o Swagger com Bearer Auth e o filtro que adiciona ProblemDetails nos responses.
        /// </summary>
        public static IServiceCollection AddSwaggerGenWithAuthAndProblemDetails(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "KitCerto API",
                    Version = "v1",
                    Description = "API do e-commerce KitCerto (Clean Arch + CQRS)."
                });

                var scheme = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                };

                c.AddSecurityDefinition("Bearer", scheme);
                c.AddSecurityRequirement(new OpenApiSecurityRequirement { { scheme, Array.Empty<string>() } });

                // nosso filtro para exibir application/problem+json quando o controller declara ProblemDetails
                c.OperationFilter<AddProblemDetailsResponsesOperationFilter>();

                // Deixa os tipos não anuláveis visíveis corretamente no schema
                c.SupportNonNullableReferenceTypes();
            });

            return services;
        }
    }
}
