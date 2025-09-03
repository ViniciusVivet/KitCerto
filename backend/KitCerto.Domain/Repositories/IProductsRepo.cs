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

        Task<IReadOnlyList<Product>> SearchAsync(string? name, string? categoryId, int page, int pageSize, CancellationToken ct);
        Task<long> CountAsync(string? name, string? categoryId, CancellationToken ct);
        Task<int> LowStockCountAsync(int threshold, CancellationToken ct);
        Task<decimal> TotalStockValueAsync(CancellationToken ct);
        Task<IReadOnlyList<CategoryCount>> CountByCategoryAsync(CancellationToken ct);
    }
    
    public sealed class CategoryCount
    {
        public string CategoryId { get; set; } = "";
        public int Count { get; set; }
    }

}
