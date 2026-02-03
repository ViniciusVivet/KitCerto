using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Profile;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Profile.Queries.GetProfile;

public sealed class GetProfileHandler : IRequestHandler<GetProfileQuery, UserProfile?>
{
    private readonly IProfileRepo _repo;
    public GetProfileHandler(IProfileRepo repo) => _repo = repo;

    public Task<UserProfile?> Handle(GetProfileQuery req, CancellationToken ct)
        => _repo.GetByUserIdAsync(req.UserId, ct);
}
