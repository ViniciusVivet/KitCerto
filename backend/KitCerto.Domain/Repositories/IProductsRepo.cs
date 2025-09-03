using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using KitCerto.Domain.Products;

namespace KitCerto.Domain.Repositories
{
    public interface IProductsRepo
    {
        // Já existia:
        Task<string> CreateAsync(Product p, CancellationToken ct);

        // NOVOS (leitura)
        Task<Product?> GetByIdAsync(string id, CancellationToken ct);
        Task<IReadOnlyList<Product>> ListAsync(int page, int pageSize, CancellationToken ct);
    }
}
