using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Sellers;

namespace KitCerto.Domain.Repositories
{
    public interface ISellerRequestsRepo
    {
        Task<string> CreateAsync(SellerRequest req, CancellationToken ct);
        Task<SellerRequest?> GetByIdAsync(string id, CancellationToken ct);
        Task<IReadOnlyList<SellerRequest>> ListAsync(string? status, string? userId, CancellationToken ct);
        Task UpdateStatusAsync(string id, string status, CancellationToken ct);
    }
}
