using System;
using System.Linq;
using System.Reflection;
using KitCerto.Domain.Products;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Products.Create;

public sealed class CreateProductHandler : IRequestHandler<CreateProductCmd, string>
{
    private readonly IProductsRepo _repo;
    public CreateProductHandler(IProductsRepo repo) => _repo = repo;

    public async Task<string> Handle(CreateProductCmd req, CancellationToken ct)
    {
        var media = (req.Media ?? Array.Empty<CreateProductMedia>())
            .Select(m => new ProductMedia(m.Url, m.Type))
            .ToList();
        var product = new Product(
            req.Name,
            req.Description,
            req.Price,
            req.CategoryId,
            req.Quantity,
            req.Stock,
            media
        );
        var id = $"p-{Guid.NewGuid():N}";
        typeof(Product).GetProperty(nameof(Product.Id), BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)!
            .SetValue(product, id);
        if (!string.IsNullOrWhiteSpace(req.SellerId))
            product.SellerId = req.SellerId;
        await _repo.CreateAsync(product, ct);
        return id;
    }
}
