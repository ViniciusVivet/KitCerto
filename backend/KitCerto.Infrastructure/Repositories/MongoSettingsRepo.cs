using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Settings;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoSettingsRepo : ISettingsRepo
    {
        private readonly IMongoCollection<StoreSettings> _col;

        public MongoSettingsRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<StoreSettings>("settings");
        }

        public async Task<StoreSettings> GetAsync(CancellationToken ct)
        {
            var settings = await _col.Find(x => x.Id == "global_settings").FirstOrDefaultAsync(ct);
            if (settings is null)
            {
                settings = new StoreSettings();
                await _col.InsertOneAsync(settings, cancellationToken: ct);
            }
            return settings;
        }

        public async Task UpdateAsync(StoreSettings settings, CancellationToken ct)
        {
            var filter = Builders<StoreSettings>.Filter.Eq(x => x.Id, "global_settings");
            await _col.ReplaceOneAsync(filter, settings, new ReplaceOptions { IsUpsert = true }, cancellationToken: ct);
        }
    }
}
