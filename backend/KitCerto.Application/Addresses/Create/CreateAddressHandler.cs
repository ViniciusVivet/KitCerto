using System;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Addresses;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Addresses.Create;

public sealed class CreateAddressHandler : IRequestHandler<CreateAddressCmd, string>
{
    private readonly IAddressRepo _repo;
    public CreateAddressHandler(IAddressRepo repo) => _repo = repo;

    public async Task<string> Handle(CreateAddressCmd req, CancellationToken ct)
    {
        if (req.IsDefault)
            await _repo.UnsetDefaultForUserAsync(req.UserId, ct);

        var id = Guid.NewGuid().ToString("N");
        var address = new Address(id, req.UserId, req.Label, req.Street, req.Number, req.Complement, req.Neighborhood, req.City, req.State, req.ZipCode, req.IsDefault);
        await _repo.CreateAsync(address, ct);
        return id;
    }
}
