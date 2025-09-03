using MediatR;

namespace KitCerto.Application.Products.Update
{
    public sealed record UpdateProductCmd(
        string Id,
        string Name,
        string Description,
        decimal Price,
        int Stock,
        string CategoryId
    ) : IRequest;
}
