using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Orders;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoOrdersRepo : IOrdersRepo
    {
        private readonly IMongoCollection<Order> _col;

        public MongoOrdersRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<Order>("orders");
        }

        public async Task<string> CreateAsync(Order order, CancellationToken ct)
        {
            await _col.InsertOneAsync(order, cancellationToken: ct);
            return order.Id;
        }

        public async Task<Order?> GetByIdAsync(string id, CancellationToken ct)
        {
            var filter = Builders<Order>.Filter.Eq(x => x.Id, id);
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<IReadOnlyList<Order>> ListByUserAsync(string userId, CancellationToken ct)
        {
            var filter = Builders<Order>.Filter.Eq(x => x.UserId, userId);
            return await _col.Find(filter).SortByDescending(x => x.CreatedAtUtc).ToListAsync(ct);
        }

        public async Task<IReadOnlyList<Order>> ListAllAsync(CancellationToken ct)
        {
            return await _col.Find(FilterDefinition<Order>.Empty).SortByDescending(x => x.CreatedAtUtc).ToListAsync(ct);
        }

        public async Task<IReadOnlyList<Order>> ListWhereItemsContainProductIdsAsync(IReadOnlyList<string> productIds, CancellationToken ct)
        {
            if (productIds == null || productIds.Count == 0) return new List<Order>();
            var filter = Builders<Order>.Filter.ElemMatch(x => x.Items, Builders<OrderItem>.Filter.In(i => i.ProductId, productIds));
            return await _col.Find(filter).SortByDescending(x => x.CreatedAtUtc).ToListAsync(ct);
        }

        public async Task UpdatePaymentAsync(string id, string provider, string preferenceId, CancellationToken ct)
        {
            var filter = Builders<Order>.Filter.Eq(x => x.Id, id);
            var update = Builders<Order>.Update
                .Set(x => x.PaymentProvider, provider)
                .Set(x => x.PaymentPreferenceId, preferenceId)
                .Set(x => x.UpdatedAtUtc, System.DateTime.UtcNow);
            await _col.UpdateOneAsync(filter, update, cancellationToken: ct);
        }

        public async Task UpdateStatusAsync(string id, string status, CancellationToken ct)
        {
            var filter = Builders<Order>.Filter.Eq(x => x.Id, id);
            var update = Builders<Order>.Update
                .Set(x => x.Status, status)
                .Set(x => x.UpdatedAtUtc, System.DateTime.UtcNow);
            await _col.UpdateOneAsync(filter, update, cancellationToken: ct);
        }
    }
}
