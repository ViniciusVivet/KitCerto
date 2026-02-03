using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Coupons;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoCouponsRepo : ICouponsRepo
    {
        private readonly IMongoCollection<Coupon> _col;

        public MongoCouponsRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<Coupon>("coupons");
        }

        public async Task<IReadOnlyList<Coupon>> ListActiveAsync(DateTime at, CancellationToken ct)
        {
            var builder = Builders<Coupon>.Filter;
            var f = builder.And(
                builder.Lte(x => x.ValidFrom, at),
                builder.Gte(x => x.ValidUntil, at)
            );
            var list = await _col.Find(f).ToListAsync(ct);
            var result = new List<Coupon>();
            foreach (var c in list)
            {
                if (c.MaxUses <= 0 || c.UsedCount < c.MaxUses)
                    result.Add(c);
            }
            return result;
        }

        public async Task<Coupon?> GetByCodeAsync(string code, CancellationToken ct)
        {
            var filter = Builders<Coupon>.Filter.Eq(x => x.Code, code);
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<Coupon> CreateAsync(Coupon coupon, CancellationToken ct)
        {
            await _col.InsertOneAsync(coupon, cancellationToken: ct);
            return coupon;
        }

        public async Task IncrementUsedCountAsync(string couponId, CancellationToken ct)
        {
            var filter = Builders<Coupon>.Filter.Eq(x => x.Id, couponId);
            var update = Builders<Coupon>.Update.Inc(x => x.UsedCount, 1);
            await _col.UpdateOneAsync(filter, update, cancellationToken: ct);
        }
    }
}
