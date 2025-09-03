using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace KitCerto.API.Swagger.Filters
{
    /// <summary>
    /// Adiciona respostas de erro padronizadas (ProblemDetails) globalmente no Swagger.
    /// </summary>
    public sealed class AddProblemDetailsResponsesOperationFilter : IOperationFilter
    {
        private static OpenApiMediaType BuildProblemDetailsExample(string title, int status, string detail)
        {
            return new OpenApiMediaType
            {
                Schema = new OpenApiSchema
                {
                    Type = "object",
                    Properties = new Dictionary<string, OpenApiSchema>
                    {
                        ["type"]     = new OpenApiSchema { Type = "string", Nullable = true },
                        ["title"]    = new OpenApiSchema { Type = "string", Nullable = true },
                        ["status"]   = new OpenApiSchema { Type = "integer", Format = "int32", Nullable = true },
                        ["detail"]   = new OpenApiSchema { Type = "string", Nullable = true },
                        ["instance"] = new OpenApiSchema { Type = "string", Nullable = true }
                    }
                },
                Example = new OpenApiObject
                {
                    ["type"]     = new OpenApiString($"https://httpstatuses.com/{status}"),
                    ["title"]    = new OpenApiString(title),
                    ["status"]   = new OpenApiInteger(status),
                    ["detail"]   = new OpenApiString(detail),
                    ["instance"] = new OpenApiString("/api/example/request-id")
                }
            };
        }

        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            operation.Responses ??= new OpenApiResponses();

            if (!operation.Responses.ContainsKey("400"))
            {
                operation.Responses.Add("400", new OpenApiResponse
                {
                    Description = "Erro de validação (ProblemDetails)",
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["application/json"] = BuildProblemDetailsExample(
                            title: "Validation error",
                            status: 400,
                            detail: "Um ou mais campos são inválidos."
                        )
                    }
                });
            }

            if (!operation.Responses.ContainsKey("401"))
            {
                operation.Responses.Add("401", new OpenApiResponse
                {
                    Description = "Não autenticado (JWT inválido/ausente)",
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["application/json"] = BuildProblemDetailsExample(
                            title: "Unauthorized",
                            status: 401,
                            detail: "Token inválido, expirado ou ausente."
                        )
                    }
                });
            }

            if (!operation.Responses.ContainsKey("404"))
            {
                operation.Responses.Add("404", new OpenApiResponse
                {
                    Description = "Recurso não encontrado (ProblemDetails)",
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["application/json"] = BuildProblemDetailsExample(
                            title: "Not Found",
                            status: 404,
                            detail: "O recurso indicado não foi localizado."
                        )
                    }
                });
            }

            if (!operation.Responses.ContainsKey("500"))
            {
                operation.Responses.Add("500", new OpenApiResponse
                {
                    Description = "Erro interno (ProblemDetails)",
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["application/json"] = BuildProblemDetailsExample(
                            title: "Unexpected error",
                            status: 500,
                            detail: "Ocorreu um erro inesperado ao processar a solicitação."
                        )
                    }
                });
            }
        }
    }
}
