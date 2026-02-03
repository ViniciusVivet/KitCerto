using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Favorites;

namespace KitCerto.Domain.Repositories
{
    public interface IFavoritesRepo
    {
        Task<IReadOnlyList<UserFavorite>> ListByUserAsync(string userId, CancellationToken ct);
        Task<UserFavorite?> GetByUserAndProductAsync(string userId, string productId, CancellationToken ct);
        Task<UserFavorite> AddAsync(UserFavorite favorite, CancellationToken ct);
        Task RemoveAsync(string userId, string productId, CancellationToken ct);
        Task<bool> ExistsAsync(string userId, string productId, CancellationToken ct);
    }
}
