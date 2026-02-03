using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Support.Queries.ListTicketMessages;

public sealed class ListTicketMessagesHandler : IRequestHandler<ListTicketMessagesQuery, IReadOnlyList<TicketMessageDto>>
{
    private readonly ISupportTicketsRepo _tickets;
    private readonly ITicketMessagesRepo _messages;
    private readonly ISellersRepo _sellers;

    public ListTicketMessagesHandler(ISupportTicketsRepo tickets, ITicketMessagesRepo messages, ISellersRepo sellers)
    {
        _tickets = tickets;
        _messages = messages;
        _sellers = sellers;
    }

    public async Task<IReadOnlyList<TicketMessageDto>> Handle(ListTicketMessagesQuery req, CancellationToken ct)
    {
        if (req.IsAdmin)
        {
            var ticket = await _tickets.GetByTicketIdAsync(req.TicketId, ct);
            if (ticket is null) return new List<TicketMessageDto>();
            var list = await _messages.ListByTicketIdAsync(req.TicketId, ct);
            return list.Select(m => new TicketMessageDto(m.Id, m.Message, m.SenderUserId, m.CreatedAtUtc)).ToList();
        }

        var t = await _tickets.GetByIdAsync(req.UserId, req.TicketId, ct);
        if (t is null)
        {
            t = await _tickets.GetByTicketIdAsync(req.TicketId, ct);
            if (t is null) return new List<TicketMessageDto>();
            if (!string.IsNullOrWhiteSpace(t.SellerId))
            {
                var seller = await _sellers.GetByUserIdAsync(req.UserId, ct);
                if (seller?.Id != t.SellerId)
                    return new List<TicketMessageDto>();
            }
            else
                return new List<TicketMessageDto>();
        }

        var list2 = await _messages.ListByTicketIdAsync(req.TicketId, ct);
        return list2.Select(m => new TicketMessageDto(m.Id, m.Message, m.SenderUserId, m.CreatedAtUtc)).ToList();
    }
}
