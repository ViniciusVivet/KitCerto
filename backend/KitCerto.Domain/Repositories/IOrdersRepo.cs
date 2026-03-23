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
        Task<IReadOnlyList<Order>> ListAllAsync(CancellationToken ct);
        /// <summary>Lista pedidos que contêm pelo menos um item cujo ProductId está em productIds.</summary>
        Task<IReadOnlyList<Order>> ListWhereItemsContainProductIdsAsync(IReadOnlyList<string> productIds, CancellationToken ct);
        Task UpdatePaymentAsync(string id, string provider, string preferenceId, CancellationToken ct);
        Task UpdateStatusAsync(string id, string status, CancellationToken ct);
        /// <summary>Busca pedido pelo ID e valida o GuestToken — usado para consulta de status sem autenticação.</summary>
        Task<Order?> GetByIdAndGuestTokenAsync(string id, string guestToken, CancellationToken ct);
    }
}
