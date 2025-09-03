using System.Net;
using System.Text.Json;
using System.Threading.Tasks;         // <-- ADICIONE ESTA LINHA
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;

namespace KitCerto.API.Middlewares
{
    public sealed class ProblemDetailsMiddleware
    {
        private readonly RequestDelegate _next;
        public ProblemDetailsMiddleware(RequestDelegate next) => _next = next;

        public async Task Invoke(HttpContext ctx)   // Task precisa do using acima
        {
            try
            {
                await _next(ctx);
            }
            catch (Exception ex)
            {
                var problem = new ProblemDetails
                {
                    Title = "Unexpected error",
                    Detail = ex.Message,
                    Status = (int)HttpStatusCode.InternalServerError,
                    Instance = ctx.TraceIdentifier,
                    Type = "https://httpstatuses.com/500"
                };

                ctx.Response.StatusCode = problem.Status ?? 500;
                ctx.Response.ContentType = "application/problem+json";
                await ctx.Response.WriteAsync(JsonSerializer.Serialize(problem));
            }
        }
    }
}
