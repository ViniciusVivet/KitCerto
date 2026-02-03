using MediatR;

namespace KitCerto.Application.Favorites.Add;

public sealed record AddFavoriteCmd(string UserId, string ProductId) : IRequest;
