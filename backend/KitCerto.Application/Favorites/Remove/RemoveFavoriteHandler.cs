using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Favorites.Remove;

public sealed class RemoveFavoriteHandler : IRequestHandler<RemoveFavoriteCmd>
{
    private readonly IFavoritesRepo _repo;
    public RemoveFavoriteHandler(IFavoritesRepo repo) => _repo = repo;

    public Task Handle(RemoveFavoriteCmd req, CancellationToken ct)
        => _repo.RemoveAsync(req.UserId, req.ProductId, ct);
}
