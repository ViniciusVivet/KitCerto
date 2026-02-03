using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Profile;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoProfileRepo : IProfileRepo
    {
        private readonly IMongoCollection<UserProfile> _col;

        public MongoProfileRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<UserProfile>("profiles");
        }

        public async Task<UserProfile?> GetByUserIdAsync(string userId, CancellationToken ct)
        {
            return await _col.Find(x => x.UserId == userId).FirstOrDefaultAsync(ct);
        }

        public async Task UpsertAsync(UserProfile profile, CancellationToken ct)
        {
            var filter = Builders<UserProfile>.Filter.Eq(x => x.UserId, profile.UserId);
            await _col.ReplaceOneAsync(filter, profile, new ReplaceOptions { IsUpsert = true }, ct);
        }
    }
}
