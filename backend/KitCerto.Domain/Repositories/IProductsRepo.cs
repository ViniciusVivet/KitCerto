using KitCerto.Domain.Products;

namespace KitCerto.Domain.Repositories;

public interface IProductsRepo
{
    Task<string> CreateAsync(Product p, CancellationToken ct);
}
