using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Support.Queries.ListAllTickets;

public sealed class ListAllTicketsHandler : IRequestHandler<ListAllTicketsQuery, IReadOnlyList<AllTicketsDto>>
{
    private readonly ISupportTicketsRepo _tickets;

    public ListAllTicketsHandler(ISupportTicketsRepo tickets)
    {
        _tickets = tickets;
    }

    public async Task<IReadOnlyList<AllTicketsDto>> Handle(ListAllTicketsQuery req, CancellationToken ct)
    {
        var list = await _tickets.ListAllAsync(ct);
        return list.Select(t => new AllTicketsDto(
            t.Id, t.UserId, t.Subject, t.Message, t.Status,
            t.OrderId, t.SellerId, t.CreatedAtUtc, t.UpdatedAtUtc
        )).ToList();
    }
}
