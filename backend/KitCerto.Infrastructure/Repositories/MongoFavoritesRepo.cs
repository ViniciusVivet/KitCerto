using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Favorites;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoFavoritesRepo : IFavoritesRepo
    {
        private readonly IMongoCollection<UserFavorite> _col;

        public MongoFavoritesRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<UserFavorite>("favorites");
        }

        public async Task<IReadOnlyList<UserFavorite>> ListByUserAsync(string userId, CancellationToken ct)
        {
            var filter = Builders<UserFavorite>.Filter.Eq(x => x.UserId, userId);
            var list = await _col.Find(filter).SortByDescending(x => x.CreatedAtUtc).ToListAsync(ct);
            return list;
        }

        public async Task<UserFavorite?> GetByUserAndProductAsync(string userId, string productId, CancellationToken ct)
        {
            var filter = Builders<UserFavorite>.Filter.And(
                Builders<UserFavorite>.Filter.Eq(x => x.UserId, userId),
                Builders<UserFavorite>.Filter.Eq(x => x.ProductId, productId)
            );
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<UserFavorite> AddAsync(UserFavorite favorite, CancellationToken ct)
        {
            await _col.InsertOneAsync(favorite, cancellationToken: ct);
            return favorite;
        }

        public async Task RemoveAsync(string userId, string productId, CancellationToken ct)
        {
            var filter = Builders<UserFavorite>.Filter.And(
                Builders<UserFavorite>.Filter.Eq(x => x.UserId, userId),
                Builders<UserFavorite>.Filter.Eq(x => x.ProductId, productId)
            );
            await _col.DeleteOneAsync(filter, ct);
        }

        public async Task<bool> ExistsAsync(string userId, string productId, CancellationToken ct)
        {
            var filter = Builders<UserFavorite>.Filter.And(
                Builders<UserFavorite>.Filter.Eq(x => x.UserId, userId),
                Builders<UserFavorite>.Filter.Eq(x => x.ProductId, productId)
            );
            var count = await _col.CountDocumentsAsync(filter, cancellationToken: ct);
            return count > 0;
        }
    }
}
