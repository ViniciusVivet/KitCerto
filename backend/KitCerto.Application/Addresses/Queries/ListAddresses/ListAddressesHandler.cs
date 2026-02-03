using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Addresses;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Addresses.Queries.ListAddresses;

public sealed class ListAddressesHandler : IRequestHandler<ListAddressesQuery, IReadOnlyList<Address>>
{
    private readonly IAddressRepo _repo;
    public ListAddressesHandler(IAddressRepo repo) => _repo = repo;

    public Task<IReadOnlyList<Address>> Handle(ListAddressesQuery req, CancellationToken ct)
        => _repo.ListByUserAsync(req.UserId, ct);
}
