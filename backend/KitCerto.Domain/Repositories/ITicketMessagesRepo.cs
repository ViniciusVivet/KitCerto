using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Support;

namespace KitCerto.Domain.Repositories
{
    public interface ITicketMessagesRepo
    {
        Task<TicketMessage> AddAsync(TicketMessage message, CancellationToken ct);
        Task<IReadOnlyList<TicketMessage>> ListByTicketIdAsync(string ticketId, CancellationToken ct);
    }
}
