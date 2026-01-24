using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Products;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace KitCerto.Infrastructure.Repositories
{
    public sealed class MongoProductsRepo : IProductsRepo
    {
        private readonly IMongoCollection<Product> _col;

        public MongoProductsRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<Product>("products");
        }

        public async Task<string> CreateAsync(Product p, CancellationToken ct)
        {
            await _col.InsertOneAsync(p, cancellationToken: ct);
            return p.Id;
        }

        public async Task<Product?> GetByIdAsync(string id, CancellationToken ct)
        {
            var filter = Builders<Product>.Filter.Eq(x => x.Id, id);
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<IReadOnlyList<Product>> ListAsync(int page, int pageSize, CancellationToken ct)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 20;

            var skip = (page - 1) * pageSize;

            return await _col
                .Find(FilterDefinition<Product>.Empty)
                .Skip(skip)
                .Limit(pageSize)
                .ToListAsync(ct);
        }

        // NOVOS
        public async Task UpdateAsync(string id, string name, string description, decimal price, int stock, string categoryId, IReadOnlyList<ProductMedia> media, CancellationToken ct)
        {
            var filter = Builders<Product>.Filter.Eq(x => x.Id, id);
            var update = Builders<Product>.Update
                .Set(x => x.Name, name)
                .Set(x => x.Description, description)
                .Set(x => x.Price, price)
                .Set(x => x.Stock, stock)
                .Set(x => x.CategoryId, categoryId)
                .Set(x => x.Media, media);

            await _col.UpdateOneAsync(filter, update, cancellationToken: ct);
        }

        public async Task DeleteAsync(string id, CancellationToken ct)
        {
            var filter = Builders<Product>.Filter.Eq(x => x.Id, id);
            await _col.DeleteOneAsync(filter, ct);
        }

        public async Task UpdateStockAsync(string id, int stock, CancellationToken ct)
        {
            var filter = Builders<Product>.Filter.Eq(x => x.Id, id);
            var update = Builders<Product>.Update.Set(x => x.Stock, stock);
            await _col.UpdateOneAsync(filter, update, cancellationToken: ct);
        }

        public async Task<IReadOnlyList<Product>> ListLowStockAsync(int threshold, CancellationToken ct)
        {
            var filter = Builders<Product>.Filter.Lt(x => x.Stock, threshold);
            return await _col.Find(filter).ToListAsync(ct);
        }

        public async Task<IReadOnlyList<Product>> SearchAsync(string? name, string? categoryId, int page, int pageSize, CancellationToken ct)
        {
            var filter = Builders<Product>.Filter.Empty;

            if (!string.IsNullOrWhiteSpace(name))
            {
                // contém no nome (case-insensitive)
                var nameFilter = Builders<Product>.Filter.Regex(x => x.Name, new MongoDB.Bson.BsonRegularExpression(name, "i"));
                filter = Builders<Product>.Filter.And(filter, nameFilter);
            }

            if (!string.IsNullOrWhiteSpace(categoryId))
            {
                var catFilter = Builders<Product>.Filter.Eq(x => x.CategoryId, categoryId);
                filter = Builders<Product>.Filter.And(filter, catFilter);
            }

            var skip = (page - 1) * pageSize;

            var items = await _col.Find(filter)
                                  .Skip(skip)
                                  .Limit(pageSize)
                                  .ToListAsync(ct);

            return items;
        }

        public async Task<long> CountAsync(string? name, string? categoryId, CancellationToken ct)
        {
            var filter = Builders<Product>.Filter.Empty;

            if (!string.IsNullOrWhiteSpace(name))
            {
                var nameFilter = Builders<Product>.Filter.Regex(x => x.Name, new MongoDB.Bson.BsonRegularExpression(name, "i"));
                filter = Builders<Product>.Filter.And(filter, nameFilter);
            }

            if (!string.IsNullOrWhiteSpace(categoryId))
            {
                var catFilter = Builders<Product>.Filter.Eq(x => x.CategoryId, categoryId);
                filter = Builders<Product>.Filter.And(filter, catFilter);
            }

            return await _col.CountDocumentsAsync(filter, cancellationToken: ct);
        }

        public async Task<int> LowStockCountAsync(int threshold, CancellationToken ct)
        {
            var filter = Builders<Product>.Filter.Lt(x => x.Stock, threshold);
            var count = await _col.CountDocumentsAsync(filter, cancellationToken: ct);
            return (int)count;
        }

        public async Task<decimal> TotalStockValueAsync(CancellationToken ct)
        {
            // soma (price * stock)
            var pipeline = _col.Aggregate()
                .Project(p => new { Value = p.Price * p.Stock })
                .Group(x => 1, g => new { Total = g.Sum(x => x.Value) });

            var result = await pipeline.FirstOrDefaultAsync(ct);
            return result?.Total ?? 0m;
        }

        public async Task<IReadOnlyList<CategoryCount>> CountByCategoryAsync(CancellationToken ct)
        {
            var pipeline = _col.Aggregate()
                .Group(p => p.CategoryId, g => new { CategoryId = g.Key, Count = g.Count() });

            var list = await pipeline.ToListAsync(ct);

            return list.Select(x => new CategoryCount
            {
                CategoryId = x.CategoryId,
                Count = x.Count
            }).ToList();
        }

        public async Task<IReadOnlyList<CategoryValue>> ValueByCategoryAsync(CancellationToken ct)
        {
            var pipeline = _col.Aggregate()
                .Group(p => p.CategoryId, g => new { CategoryId = g.Key, TotalValue = g.Sum(x => x.Price * x.Stock) });

            var list = await pipeline.ToListAsync(ct);

            return list.Select(x => new CategoryValue
            {
                CategoryId = x.CategoryId,
                TotalValue = x.TotalValue
            }).ToList();
        }

        public async Task<IReadOnlyList<Product>> TopProductsByValueAsync(int limit, CancellationToken ct)
        {
            return await _col
                .Find(FilterDefinition<Product>.Empty)
                .Sort(Builders<Product>.Sort.Descending(x => x.Price * x.Stock))
                .Limit(limit)
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<PriceBucket>> PriceBucketsAsync(CancellationToken ct)
        {
            var buckets = new List<PriceBucket>();
            
            // Buckets: 0-50, 50-100, 100-200, 200-500, 500+
            var ranges = new[]
            {
                new { Min = 0m, Max = 50m, Label = "R$ 0 - R$ 50" },
                new { Min = 50m, Max = 100m, Label = "R$ 50 - R$ 100" },
                new { Min = 100m, Max = 200m, Label = "R$ 100 - R$ 200" },
                new { Min = 200m, Max = 500m, Label = "R$ 200 - R$ 500" },
                new { Min = 500m, Max = decimal.MaxValue, Label = "R$ 500+" }
            };

            foreach (var range in ranges)
            {
                var filter = Builders<Product>.Filter.And(
                    Builders<Product>.Filter.Gte(x => x.Price, range.Min),
                    Builders<Product>.Filter.Lt(x => x.Price, range.Max)
                );
                
                var count = await _col.CountDocumentsAsync(filter, cancellationToken: ct);
                buckets.Add(new PriceBucket { Range = range.Label, Count = (int)count });
            }

            return buckets;
        }

        public async Task<IReadOnlyList<Product>> LowStockItemsAsync(int threshold, CancellationToken ct)
        {
            var filter = Builders<Product>.Filter.Lt(x => x.Stock, threshold);
            return await _col.Find(filter).ToListAsync(ct);
        }
    }
}
