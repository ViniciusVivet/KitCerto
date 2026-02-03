using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Favorites.Queries.ListFavorites;

public sealed class ListFavoritesHandler : IRequestHandler<ListFavoritesQuery, IReadOnlyList<FavoriteItemDto>>
{
    private readonly IFavoritesRepo _favoritesRepo;
    private readonly IProductsRepo _productsRepo;

    public ListFavoritesHandler(IFavoritesRepo favoritesRepo, IProductsRepo productsRepo)
    {
        _favoritesRepo = favoritesRepo;
        _productsRepo = productsRepo;
    }

    public async Task<IReadOnlyList<FavoriteItemDto>> Handle(ListFavoritesQuery req, CancellationToken ct)
    {
        var favorites = await _favoritesRepo.ListByUserAsync(req.UserId, ct);
        var result = new List<FavoriteItemDto>();
        foreach (var f in favorites)
        {
            var product = await _productsRepo.GetByIdAsync(f.ProductId, ct);
            var imageUrl = product?.Media?.FirstOrDefault()?.Url;
            result.Add(new FavoriteItemDto(
                f.ProductId,
                product?.Name,
                product?.Price,
                imageUrl,
                f.CreatedAtUtc.ToString("O")
            ));
        }
        return result;
    }
}
