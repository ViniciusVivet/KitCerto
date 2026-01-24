using System.Collections.Generic;
using MediatR;

namespace KitCerto.Application.Products.Update
{
    public sealed record UpdateProductCmd(
        string Id,
        string Name,
        string Description,
        decimal Price,
        int Stock,
        string CategoryId,
        IReadOnlyList<UpdateProductMedia>? Media
    ) : IRequest;

    public sealed record UpdateProductMedia(string Url, string Type);
}
