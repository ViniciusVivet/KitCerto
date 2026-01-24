using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Orders;

namespace KitCerto.Domain.Repositories
{
    public interface IOrdersRepo
    {
        Task<string> CreateAsync(Order order, CancellationToken ct);
        Task<Order?> GetByIdAsync(string id, CancellationToken ct);
        Task<IReadOnlyList<Order>> ListByUserAsync(string userId, CancellationToken ct);
        Task UpdatePaymentAsync(string id, string provider, string preferenceId, CancellationToken ct);
    }
}
