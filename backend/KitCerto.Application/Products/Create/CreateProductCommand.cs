using MediatR;

namespace KitCerto.Application.Products.Create;

public sealed record CreateProductCmd(
    string Name,
    string Description,
    decimal Price,
    string CategoryId,
    int Quantity,
    int Stock
) : IRequest<string>;