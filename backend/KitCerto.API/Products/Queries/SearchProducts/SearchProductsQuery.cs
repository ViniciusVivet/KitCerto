using System.Collections.Generic;
using MediatR;
using KitCerto.Domain.Products;

namespace KitCerto.Application.Products.Queries.SearchProducts
{
    public sealed record SearchProductsQuery(
        int Page = 1,
        int PageSize = 20,
        string? Name = null,
        string? CategoryId = null
    ) : IRequest<SearchProductsResult>;

    public sealed record SearchProductsResult(
        IReadOnlyList<Product> Items,
        long Total,
        int Page,
        int PageSize
    );
}
