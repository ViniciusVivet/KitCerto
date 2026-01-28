using KitCerto.Domain.Categories;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace KitCerto.Domain.Repositories
{
    public interface ICategoriesRepo
    {
        Task<string> CreateAsync(Category c, CancellationToken ct);
        Task<Category?> GetByIdAsync(string id, CancellationToken ct);
        Task<IReadOnlyList<Category>> ListAsync(int page, int pageSize, CancellationToken ct);
        Task<IReadOnlyList<Category>> GetByIdsAsync(IReadOnlyCollection<string> ids, CancellationToken ct);
        Task UpdateAsync(string id, string name, string description, CancellationToken ct);
        Task DeleteAsync(string id, CancellationToken ct);
    }
}
