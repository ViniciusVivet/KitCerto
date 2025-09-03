using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Products;

namespace KitCerto.Domain.Repositories
{
    public interface IProductsRepo
    {
        Task<string> CreateAsync(Product p, CancellationToken ct);
        Task<Product?> GetByIdAsync(string id, CancellationToken ct);
        Task<IReadOnlyList<Product>> ListAsync(int page, int pageSize, CancellationToken ct);

        // NOVOS
        Task UpdateAsync(string id, string name, string description, decimal price, int stock, string categoryId, CancellationToken ct);
        Task DeleteAsync(string id, CancellationToken ct);
        Task UpdateStockAsync(string id, int stock, CancellationToken ct);
        Task<IReadOnlyList<Product>> ListLowStockAsync(int threshold, CancellationToken ct);
    }
}
