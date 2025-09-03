using MediatR;

namespace KitCerto.Application.Products.Stock
{
    public sealed record UpdateProductStockCmd(string Id, int Stock) : IRequest;
}
