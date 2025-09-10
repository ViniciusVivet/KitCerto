using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using KitCerto.API.Swagger.Filters;

namespace KitCerto.API.Swagger
{
    public static class SwaggerServiceExtensions
    {
        // Agora recebemos IConfiguration
        public static IServiceCollection AddSwaggerGenWithAuthAndProblemDetails(
            this IServiceCollection services,
            IConfiguration cfg)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "KitCerto API",
                    Version = "v1",
                    Description = "API de gestão de produtos (Clean Architecture + CQRS + Mongo)."
                });
                // Incluir XML comments se gerado (melhora descrições no Swagger)
                try
                {
                    var xml = System.IO.Path.Combine(AppContext.BaseDirectory, "KitCerto.API.xml");
                    if (System.IO.File.Exists(xml))
                        c.IncludeXmlComments(xml);
                }
                catch { /* opcional */ }

                // Bearer simples (para testes rápidos)
                var bearer = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Insira o token JWT no formato: Bearer {token}"
                };
                c.AddSecurityDefinition("Bearer", bearer);
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    { bearer, Array.Empty<string>() }
                });

                // OAuth2 (Keycloak) – Authorization Code + PKCE
                // Suporta duas formas de configuração:
                // 1) Auth:Authority = http://keycloak:8080  +  Auth:Realm = kitcerto
                // 2) Auth:Authority = http://keycloak:8080/realms/kitcerto  (Auth:Realm opcional)
                var authorityRaw = cfg["Auth:Authority"]?.TrimEnd('/');
                var realmConfig  = cfg["Auth:Realm"];
                var audience     = cfg["Auth:Audience"];

                string? realm = realmConfig;
                string? authorityBase = authorityRaw;

                if (!string.IsNullOrWhiteSpace(authorityRaw))
                {
                    var marker = "/realms/";
                    var idx = authorityRaw.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
                    if (idx >= 0)
                    {
                        var baseUrl = authorityRaw.Substring(0, idx);
                        var realmFromAuthority = authorityRaw.Substring(idx + marker.Length);
                        if (string.IsNullOrWhiteSpace(realm))
                            realm = realmFromAuthority;
                        authorityBase = baseUrl.TrimEnd('/');
                    }
                }

                if (!string.IsNullOrWhiteSpace(authorityBase) && !string.IsNullOrWhiteSpace(realm))
                {
                    c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
                    {
                        Type = SecuritySchemeType.OAuth2,
                        Flows = new OpenApiOAuthFlows
                        {
                            AuthorizationCode = new OpenApiOAuthFlow
                            {
                                AuthorizationUrl = new Uri($"{authorityBase}/realms/{realm}/protocol/openid-connect/auth"),
                                TokenUrl         = new Uri($"{authorityBase}/realms/{realm}/protocol/openid-connect/token"),
                                Scopes = new Dictionary<string,string>
                                {
                                    { audience ?? "api", "Acesso à API KitCerto" }
                                }
                            }
                        }
                    });

                    c.AddSecurityRequirement(new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "oauth2"
                                }
                            },
                            Array.Empty<string>()
                        }
                    });
                }

                // ProblemDetails padrão para 4xx/5xx
                c.OperationFilter<AddProblemDetailsResponsesOperationFilter>();
            });

            return services;
        }
    }
}
