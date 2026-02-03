using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Addresses.SetDefault;

public sealed class SetDefaultAddressHandler : IRequestHandler<SetDefaultAddressCmd>
{
    private readonly IAddressRepo _repo;
    public SetDefaultAddressHandler(IAddressRepo repo) => _repo = repo;

    public async Task Handle(SetDefaultAddressCmd req, CancellationToken ct)
    {
        var address = await _repo.GetByIdAsync(req.UserId, req.AddressId, ct);
        if (address is null) return;
        await _repo.UnsetDefaultForUserAsync(req.UserId, ct);
        address.SetDefault(true);
        await _repo.UpdateAsync(address, ct);
    }
}
