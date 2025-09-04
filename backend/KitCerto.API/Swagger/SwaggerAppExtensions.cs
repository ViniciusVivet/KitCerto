using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;

namespace KitCerto.API.Swagger
{
    public static class SwaggerAppExtensions
    {
        public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app, IConfiguration cfg)
        {
            app.UseSwagger();

            app.UseSwaggerUI(o =>
            {
                o.SwaggerEndpoint("/swagger/v1/swagger.json", "KitCerto API v1");
                o.DocumentTitle = "KitCerto API Docs";

                // OAuth2 (Keycloak) – PKCE
                var clientId = cfg["Auth:Swagger:ClientId"] ?? "swagger-ui";
                o.OAuthClientId(clientId);
                o.OAuthUsePkce();
                o.OAuthScopeSeparator(" ");
            });

            return app;
        }
    }
}
