using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Support.Queries.ListTicketsForSeller;

public sealed class ListTicketsForSellerHandler : IRequestHandler<ListTicketsForSellerQuery, IReadOnlyList<TicketForSellerDto>>
{
    private readonly ISellersRepo _sellers;
    private readonly ISupportTicketsRepo _tickets;

    public ListTicketsForSellerHandler(ISellersRepo sellers, ISupportTicketsRepo tickets)
    {
        _sellers = sellers;
        _tickets = tickets;
    }

    public async Task<IReadOnlyList<TicketForSellerDto>> Handle(ListTicketsForSellerQuery req, CancellationToken ct)
    {
        var seller = await _sellers.GetByUserIdAsync(req.UserId, ct);
        if (seller is null)
            return new List<TicketForSellerDto>();

        var list = await _tickets.ListBySellerIdAsync(seller.Id, ct);
        return list.Select(t => new TicketForSellerDto(
            t.Id, t.UserId, t.Subject, t.Message, t.Status,
            t.OrderId, t.SellerId, t.CreatedAtUtc, t.UpdatedAtUtc
        )).ToList();
    }
}
