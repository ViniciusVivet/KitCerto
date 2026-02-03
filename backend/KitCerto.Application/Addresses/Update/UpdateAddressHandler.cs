using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Addresses.Update;

public sealed class UpdateAddressHandler : IRequestHandler<UpdateAddressCmd>
{
    private readonly IAddressRepo _repo;
    public UpdateAddressHandler(IAddressRepo repo) => _repo = repo;

    public async Task Handle(UpdateAddressCmd req, CancellationToken ct)
    {
        var address = await _repo.GetByIdAsync(req.UserId, req.AddressId, ct);
        if (address is null) return;

        if (req.IsDefault && !address.IsDefault)
            await _repo.UnsetDefaultForUserAsync(req.UserId, ct);

        address.Update(req.Label, req.Street, req.Number, req.Complement, req.Neighborhood, req.City, req.State, req.ZipCode);
        address.SetDefault(req.IsDefault);
        await _repo.UpdateAsync(address, ct);
    }
}
