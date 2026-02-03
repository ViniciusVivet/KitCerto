using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Profile;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Profile.Update;

public sealed class UpdateProfileHandler : IRequestHandler<UpdateProfileCmd>
{
    private readonly IProfileRepo _repo;
    public UpdateProfileHandler(IProfileRepo repo) => _repo = repo;

    public async Task Handle(UpdateProfileCmd req, CancellationToken ct)
    {
        var profile = await _repo.GetByUserIdAsync(req.UserId, ct);
        if (profile is null)
        {
            profile = new UserProfile(req.UserId, req.DisplayName, req.FullName, req.Phone, req.AvatarUrl, req.BirthDate, req.Document, req.NewsletterOptIn);
        }
        else
        {
            profile.Update(req.DisplayName, req.FullName, req.Phone, req.AvatarUrl, req.BirthDate, req.Document, req.NewsletterOptIn);
        }
        await _repo.UpsertAsync(profile, ct);
    }
}
