using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Support;

namespace KitCerto.Domain.Repositories
{
    public interface ISupportTicketsRepo
    {
        Task<SupportTicket> CreateAsync(SupportTicket ticket, CancellationToken ct);
        Task<IReadOnlyList<SupportTicket>> ListByUserAsync(string userId, CancellationToken ct);
        Task<SupportTicket?> GetByIdAsync(string userId, string ticketId, CancellationToken ct);
        /// <summary>Obtém ticket apenas por id (para seller/admin responder).</summary>
        Task<SupportTicket?> GetByTicketIdAsync(string ticketId, CancellationToken ct);
        /// <summary>Lista tickets atribuídos a um seller.</summary>
        Task<IReadOnlyList<SupportTicket>> ListBySellerIdAsync(string sellerId, CancellationToken ct);
        /// <summary>Lista todos os tickets (admin).</summary>
        Task<IReadOnlyList<SupportTicket>> ListAllAsync(CancellationToken ct);
    }
}
