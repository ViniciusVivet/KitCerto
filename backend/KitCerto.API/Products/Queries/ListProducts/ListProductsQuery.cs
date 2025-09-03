using System.Collections.Generic;
using MediatR;
using KitCerto.Domain.Products;

namespace KitCerto.Application.Products.Queries.ListProducts
{
    public sealed record ListProductsQuery(int Page = 1, int PageSize = 20)
        : IRequest<IReadOnlyList<Product>>;
}
