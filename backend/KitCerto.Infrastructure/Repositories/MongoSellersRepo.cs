using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Sellers;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoSellersRepo : ISellersRepo
    {
        private readonly IMongoCollection<Seller> _col;

        public MongoSellersRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<Seller>("sellers");
        }

        public async Task<Seller?> GetByUserIdAsync(string userId, CancellationToken ct)
        {
            var filter = Builders<Seller>.Filter.Eq(x => x.UserId, userId);
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<Seller?> GetByIdAsync(string sellerId, CancellationToken ct)
        {
            var filter = Builders<Seller>.Filter.Eq(x => x.Id, sellerId);
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<Seller> CreateAsync(Seller seller, CancellationToken ct)
        {
            await _col.InsertOneAsync(seller, cancellationToken: ct);
            return seller;
        }
    }
}
