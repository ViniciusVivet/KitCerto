using MediatR;
using System.Collections.Generic;

namespace KitCerto.Application.Favorites.Queries.ListFavorites;

public sealed record FavoriteItemDto(
    string ProductId,
    string? ProductName,
    decimal? Price,
    string? ImageUrl,
    string CreatedAtUtc
);

public sealed record ListFavoritesQuery(string UserId) : IRequest<IReadOnlyList<FavoriteItemDto>>;
