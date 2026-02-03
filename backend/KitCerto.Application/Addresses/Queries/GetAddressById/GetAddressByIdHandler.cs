using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Addresses;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Addresses.Queries.GetAddressById;

public sealed class GetAddressByIdHandler : IRequestHandler<GetAddressByIdQuery, Address?>
{
    private readonly IAddressRepo _repo;
    public GetAddressByIdHandler(IAddressRepo repo) => _repo = repo;

    public Task<Address?> Handle(GetAddressByIdQuery req, CancellationToken ct)
        => _repo.GetByIdAsync(req.UserId, req.AddressId, ct);
}
