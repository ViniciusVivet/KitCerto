using System.Collections.Generic;
using MediatR;

namespace KitCerto.Application.Products.Create;

public sealed record CreateProductCmd(
    string Name,
    string Description,
    decimal Price,
    string CategoryId,
    int Quantity,
    int Stock,
    IReadOnlyList<CreateProductMedia>? Media
) : IRequest<string>;

public sealed record CreateProductMedia(string Url, string Type);