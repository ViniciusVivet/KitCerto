using MediatR;

namespace KitCerto.Application.Products.Delete
{
    public sealed record DeleteProductCmd(string Id, string? SellerIdForAuth = null) : IRequest;
}
