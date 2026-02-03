using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Addresses.Delete;

public sealed class DeleteAddressHandler : IRequestHandler<DeleteAddressCmd>
{
    private readonly IAddressRepo _repo;
    public DeleteAddressHandler(IAddressRepo repo) => _repo = repo;

    public Task Handle(DeleteAddressCmd req, CancellationToken ct)
        => _repo.DeleteAsync(req.UserId, req.AddressId, ct);
}
