using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Payments;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoPaymentMethodsRepo : IPaymentMethodsRepo
    {
        private readonly IMongoCollection<SavedPaymentMethod> _col;

        public MongoPaymentMethodsRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<SavedPaymentMethod>("payment_methods");
        }

        public async Task<IReadOnlyList<SavedPaymentMethod>> ListByUserIdAsync(string userId, CancellationToken ct)
        {
            var filter = Builders<SavedPaymentMethod>.Filter.Eq(x => x.UserId, userId);
            var list = await _col.Find(filter).SortByDescending(x => x.IsDefault).ThenByDescending(x => x.CreatedAtUtc).ToListAsync(ct);
            return list;
        }

        public async Task<SavedPaymentMethod?> GetByIdAndUserIdAsync(string id, string userId, CancellationToken ct)
        {
            var filter = Builders<SavedPaymentMethod>.Filter.And(
                Builders<SavedPaymentMethod>.Filter.Eq(x => x.Id, id),
                Builders<SavedPaymentMethod>.Filter.Eq(x => x.UserId, userId)
            );
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task AddAsync(SavedPaymentMethod method, CancellationToken ct)
        {
            await _col.InsertOneAsync(method, cancellationToken: ct);
        }

        public async Task DeleteAsync(string id, string userId, CancellationToken ct)
        {
            var filter = Builders<SavedPaymentMethod>.Filter.And(
                Builders<SavedPaymentMethod>.Filter.Eq(x => x.Id, id),
                Builders<SavedPaymentMethod>.Filter.Eq(x => x.UserId, userId)
            );
            await _col.DeleteOneAsync(filter, ct);
        }

        public async Task SetDefaultAsync(string id, string userId, CancellationToken ct)
        {
            var filterUser = Builders<SavedPaymentMethod>.Filter.Eq(x => x.UserId, userId);
            await _col.UpdateManyAsync(filterUser, Builders<SavedPaymentMethod>.Update.Set(x => x.IsDefault, false), null, ct);

            var filterCard = Builders<SavedPaymentMethod>.Filter.And(
                Builders<SavedPaymentMethod>.Filter.Eq(x => x.Id, id),
                Builders<SavedPaymentMethod>.Filter.Eq(x => x.UserId, userId)
            );
            await _col.UpdateOneAsync(filterCard, Builders<SavedPaymentMethod>.Update.Set(x => x.IsDefault, true), null, ct);
        }
    }
}
