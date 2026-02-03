using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Support.Queries.ListMyTickets;

public sealed class ListMyTicketsHandler : IRequestHandler<ListMyTicketsQuery, IReadOnlyList<Domain.Support.SupportTicket>>
{
    private readonly ISupportTicketsRepo _repo;
    public ListMyTicketsHandler(ISupportTicketsRepo repo) => _repo = repo;

    public Task<IReadOnlyList<Domain.Support.SupportTicket>> Handle(ListMyTicketsQuery req, CancellationToken ct)
        => _repo.ListByUserAsync(req.UserId, ct);
}
