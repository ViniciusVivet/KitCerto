using MediatR;

namespace KitCerto.Application.Favorites.Remove;

public sealed record RemoveFavoriteCmd(string UserId, string ProductId) : IRequest;
