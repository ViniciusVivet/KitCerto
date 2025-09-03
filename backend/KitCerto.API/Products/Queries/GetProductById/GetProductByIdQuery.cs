using MediatR;
using KitCerto.Domain.Products;

namespace KitCerto.Application.Products.Queries.GetProductById
{
    public sealed record GetProductByIdQuery(string Id) : IRequest<Product?>;
}
