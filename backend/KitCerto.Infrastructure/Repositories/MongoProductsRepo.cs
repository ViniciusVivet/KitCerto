using KitCerto.Domain.Products;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoProductsRepo : IProductsRepo
    {
        private readonly IMongoCollection<Product> _col;
        public MongoProductsRepo(MongoContext ctx) => _col = ctx.Db.GetCollection<Product>("products");

        public async Task<string> CreateAsync(Product p, CancellationToken ct)
        {
            await _col.InsertOneAsync(p, cancellationToken: ct);
            return p.Id; // assume string; ajuste se usar ObjectId
        }

        public async Task<Product?> GetByIdAsync(string id, CancellationToken ct)
        {
            // se for ObjectId, use Builders<Product>.Filter.Eq("_id", ObjectId.Parse(id))
            var filter = Builders<Product>.Filter.Eq(x => x.Id, id);
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<IReadOnlyList<Product>> ListAsync(int page, int pageSize, CancellationToken ct)
        {
            var skip = (page - 1) * pageSize;
            var cursor = await _col.Find(Builders<Product>.Filter.Empty)
                                   .Skip(skip)
                                   .Limit(pageSize)
                                   .ToListAsync(ct);
            return cursor;
        }
    }
}
