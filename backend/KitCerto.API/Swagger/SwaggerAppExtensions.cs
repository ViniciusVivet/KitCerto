// backend/KitCerto.API/Swagger/SwaggerAppExtensions.cs
using Microsoft.AspNetCore.Builder;

namespace KitCerto.API.Swagger;

public static class SwaggerAppExtensions
{
    public static IApplicationBuilder UseSwaggerDocs(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            // entradas do UI (um doc geral e um por área)
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "KitCerto API v1");
            c.SwaggerEndpoint("/swagger/products/swagger.json", "Products");
            c.RoutePrefix = "swagger"; // URL base: /swagger
        });

        return app;
    }
}
