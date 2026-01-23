using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using KitCerto.Domain.Sellers;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoSellerRequestsRepo : ISellerRequestsRepo
    {
        private readonly IMongoCollection<SellerRequest> _col;

        public MongoSellerRequestsRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<SellerRequest>("seller_requests");
        }

        public async Task<string> CreateAsync(SellerRequest req, CancellationToken ct)
        {
            await _col.InsertOneAsync(req, cancellationToken: ct);
            return req.Id;
        }

        public async Task<IReadOnlyList<SellerRequest>> ListAsync(string? status, string? userId, CancellationToken ct)
        {
            var filter = Builders<SellerRequest>.Filter.Empty;

            if (!string.IsNullOrWhiteSpace(status))
                filter = Builders<SellerRequest>.Filter.And(filter, Builders<SellerRequest>.Filter.Eq(x => x.Status, status));

            if (!string.IsNullOrWhiteSpace(userId))
                filter = Builders<SellerRequest>.Filter.And(filter, Builders<SellerRequest>.Filter.Eq(x => x.UserId, userId));

            return await _col.Find(filter).ToListAsync(ct);
        }

        public async Task UpdateStatusAsync(string id, string status, CancellationToken ct)
        {
            var filter = Builders<SellerRequest>.Filter.Eq(x => x.Id, id);
            var update = Builders<SellerRequest>.Update
                .Set(x => x.Status, status)
                .Set(x => x.UpdatedAtUtc, System.DateTime.UtcNow);

            await _col.UpdateOneAsync(filter, update, cancellationToken: ct);
        }
    }
}
