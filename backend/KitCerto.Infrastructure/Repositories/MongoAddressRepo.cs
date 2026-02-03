using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Addresses;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoAddressRepo : IAddressRepo
    {
        private readonly IMongoCollection<Address> _col;

        public MongoAddressRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<Address>("addresses");
        }

        public async Task<Address?> GetByIdAsync(string userId, string addressId, CancellationToken ct)
        {
            var filter = Builders<Address>.Filter.And(
                Builders<Address>.Filter.Eq(x => x.UserId, userId),
                Builders<Address>.Filter.Eq(x => x.Id, addressId)
            );
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<IReadOnlyList<Address>> ListByUserAsync(string userId, CancellationToken ct)
        {
            var filter = Builders<Address>.Filter.Eq(x => x.UserId, userId);
            var list = await _col.Find(filter).SortByDescending(x => x.IsDefault).ThenByDescending(x => x.CreatedAtUtc).ToListAsync(ct);
            return list;
        }

        public async Task<Address> CreateAsync(Address address, CancellationToken ct)
        {
            await _col.InsertOneAsync(address, cancellationToken: ct);
            return address;
        }

        public async Task UpdateAsync(Address address, CancellationToken ct)
        {
            var filter = Builders<Address>.Filter.And(
                Builders<Address>.Filter.Eq(x => x.UserId, address.UserId),
                Builders<Address>.Filter.Eq(x => x.Id, address.Id)
            );
            await _col.ReplaceOneAsync(filter, address, cancellationToken: ct);
        }

        public async Task DeleteAsync(string userId, string addressId, CancellationToken ct)
        {
            var filter = Builders<Address>.Filter.And(
                Builders<Address>.Filter.Eq(x => x.UserId, userId),
                Builders<Address>.Filter.Eq(x => x.Id, addressId)
            );
            await _col.DeleteOneAsync(filter, ct);
        }

        public async Task UnsetDefaultForUserAsync(string userId, CancellationToken ct)
        {
            var filter = Builders<Address>.Filter.Eq(x => x.UserId, userId);
            var update = Builders<Address>.Update.Set(x => x.IsDefault, false).Set(x => x.UpdatedAtUtc, System.DateTime.UtcNow);
            await _col.UpdateManyAsync(filter, update, cancellationToken: ct);
        }
    }
}
