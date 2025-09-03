using System.Collections.Generic;
using KitCerto.Domain.Products;
using MediatR;

namespace KitCerto.Application.Products.Queries.ListLowStock
{
    public sealed record ListLowStockProductsQuery(int Threshold = 10) : IRequest<IReadOnlyList<Product>>;
}
