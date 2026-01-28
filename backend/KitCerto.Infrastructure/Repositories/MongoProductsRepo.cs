using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Products;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;
using MongoDB.Bson;

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
        public async Task UpdateAsync(string id, string name, string description, decimal price, int stock, int quantity, string categoryId, IEnumerable<ProductMedia> media, CancellationToken ct)
        {
            var filter = Builders<Product>.Filter.Eq(x => x.Id, id);
            
            var mediaList = media?.ToList() ?? new List<ProductMedia>();

            var update = Builders<Product>.Update
                .Set(x => x.Name, name)
                .Set(x => x.Description, description)
                .Set(x => x.Price, price)
                .Set(x => x.Stock, stock)
                .Set(x => x.Quantity, quantity)
                .Set(x => x.CategoryId, categoryId)
                .Set(x => x.Media, mediaList);

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
            // Somar price * stock garantindo tipos numéricos mesmo que existam documentos legados com strings
            var pipeline = _col.Aggregate<Product>()
                .Project(new BsonDocument
                {
                    { "Value", new BsonDocument("$multiply", new BsonArray
                        {
                            new BsonDocument("$toDecimal", "$Price"),
                            new BsonDocument("$toInt", "$Stock")
                        })
                    }
                })
                .Group(new BsonDocument
                {
                    { "_id", 1 },
                    { "Total", new BsonDocument("$sum", "$Value") }
                });

            var result = await pipeline.FirstOrDefaultAsync(ct);
            if (result is null) return 0m;
            var totalVal = result.GetValue("Total", BsonNull.Value);
            if (totalVal.IsDecimal128) return (decimal)totalVal.AsDecimal128;
            if (totalVal.IsDouble) return (decimal)totalVal.AsDouble;
            if (totalVal.IsInt64) return totalVal.AsInt64;
            if (totalVal.IsInt32) return totalVal.AsInt32;
            return 0m;
        }

        public async Task<IReadOnlyList<CategoryCount>> CountByCategoryAsync(CancellationToken ct)
        {
            var pipeline = _col.Aggregate<Product>()
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
            // Soma por categoria usando conversões para tipos numéricos
            var docs = await _col.Aggregate<Product>()
                .Project(new BsonDocument
                {
                    { "CategoryId", "$CategoryId" },
                    { "Value", new BsonDocument("$multiply", new BsonArray
                        {
                            new BsonDocument("$toDecimal", "$Price"),
                            new BsonDocument("$toInt", "$Stock")
                        })
                    }
                })
                .Group(new BsonDocument
                {
                    { "_id", "$CategoryId" },
                    { "TotalValue", new BsonDocument("$sum", "$Value") }
                })
                .ToListAsync(ct);

            return docs.Select(d =>
            {
                var tv = d.GetValue("TotalValue", BsonNull.Value);
                decimal totalValue = 0m;
                if (tv.IsDecimal128) totalValue = (decimal)tv.AsDecimal128;
                else if (tv.IsDouble) totalValue = (decimal)tv.AsDouble;
                else if (tv.IsInt64) totalValue = tv.AsInt64;
                else if (tv.IsInt32) totalValue = tv.AsInt32;
                return new CategoryValue
                {
                    CategoryId = d.GetValue("_id").AsString,
                    TotalValue = totalValue
                };
            }).ToList();
        }

        public async Task<IReadOnlyList<Product>> TopProductsByValueAsync(int limit, CancellationToken ct)
        {
            // Ordenar pelos itens de maior valor em estoque (price*stock) com conversão robusta
            var docs = await _col.Aggregate<Product>()
                .AppendStage<BsonDocument>(new BsonDocument("$addFields", new BsonDocument
                {
                    { "__priceNum", new BsonDocument("$toDecimal", "$Price") },
                    { "__stockNum", new BsonDocument("$toInt", "$Stock") },
                    { "__value", new BsonDocument("$multiply", new BsonArray { "$__priceNum", "$__stockNum" }) }
                }))
                .Sort(new BsonDocument("__value", -1))
                .Limit(limit)
                // Remover campos auxiliares e retornar documento no formato do Product
                .Project<BsonDocument>(new BsonDocument
                {
                    { "Id", 1 },
                    { "Name", 1 },
                    { "Description", 1 },
                    { "Price", 1 },
                    { "CategoryId", 1 },
                    { "Quantity", 1 },
                    { "Stock", 1 },
                    { "CreatedAtUtc", 1 },
                    { "Media", 1 }
                })
                .As<Product>()
                .ToListAsync(ct);

            return docs;
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
