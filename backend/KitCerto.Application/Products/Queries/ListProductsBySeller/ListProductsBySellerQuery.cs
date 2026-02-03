using System.Collections.Generic;
using MediatR;
using KitCerto.Domain.Products;

namespace KitCerto.Application.Products.Queries.ListProductsBySeller;

public sealed record ListProductsBySellerQuery(string SellerId, int Page = 1, int PageSize = 20)
    : IRequest<ListProductsBySellerResult>;

public sealed record ListProductsBySellerResult(
    IReadOnlyList<Product> Items,
    long Total
);
