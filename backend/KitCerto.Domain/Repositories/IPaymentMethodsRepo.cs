using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Payments;

namespace KitCerto.Domain.Repositories
{
    public interface IPaymentMethodsRepo
    {
        Task<IReadOnlyList<SavedPaymentMethod>> ListByUserIdAsync(string userId, CancellationToken ct);
        Task<SavedPaymentMethod?> GetByIdAndUserIdAsync(string id, string userId, CancellationToken ct);
        Task AddAsync(SavedPaymentMethod method, CancellationToken ct);
        Task DeleteAsync(string id, string userId, CancellationToken ct);
        Task SetDefaultAsync(string id, string userId, CancellationToken ct);
    }
}
