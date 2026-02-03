using System;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Favorites;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Favorites.Add;

public sealed class AddFavoriteHandler : IRequestHandler<AddFavoriteCmd>
{
    private readonly IFavoritesRepo _repo;
    public AddFavoriteHandler(IFavoritesRepo repo) => _repo = repo;

    public async Task Handle(AddFavoriteCmd req, CancellationToken ct)
    {
        var exists = await _repo.ExistsAsync(req.UserId, req.ProductId, ct);
        if (exists) return;
        var id = Guid.NewGuid().ToString("N");
        var favorite = new UserFavorite(id, req.UserId, req.ProductId);
        await _repo.AddAsync(favorite, ct);
    }
}
