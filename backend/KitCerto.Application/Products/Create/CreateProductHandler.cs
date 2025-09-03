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
        var product = new Product(req.Name, req.Description, req.Price, req.CategoryId, req.Quantity);
        return await _repo.CreateAsync(product, ct);
    }
}
