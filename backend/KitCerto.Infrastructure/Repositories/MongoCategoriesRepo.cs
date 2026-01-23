using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Categories;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Reflection;

namespace KitCerto.Infrastructure.Repositories
{
    // Implementação do contrato do Domain
    public sealed class MongoCategoriesRepo : ICategoriesRepo
    {
        private readonly IMongoCollection<Category> _col;

        public MongoCategoriesRepo(MongoContext ctx)
        {
            _col = ctx.Db.GetCollection<Category>("categories");
        }

        public async Task<string> CreateAsync(Category c, CancellationToken ct)
        {
            await _col.InsertOneAsync(c, cancellationToken: ct);
            return c.Id;
        }

        public async Task<Category?> GetByIdAsync(string id, CancellationToken ct)
        {
            // Evita problemas de deserialização mapeando manualmente
            var filter = Builders<BsonDocument>.Filter.Eq("Id", id);
            var doc = await _col.Database.GetCollection<BsonDocument>("categories")
                .Find(filter)
                .Project(Builders<BsonDocument>.Projection.Include("Id").Include("Name").Include("Description"))
                .FirstOrDefaultAsync(ct);
            if (doc is null) return null;
            return MapCategory(doc);
        }

        public async Task<IReadOnlyList<Category>> ListAsync(int page, int pageSize, CancellationToken ct)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 20;

            var skip = (page - 1) * pageSize;
            var docs = await _col.Database.GetCollection<BsonDocument>("categories")
                .Find(FilterDefinition<BsonDocument>.Empty)
                .Project(Builders<BsonDocument>.Projection.Include("Id").Include("Name").Include("Description"))
                .Skip(skip)
                .Limit(pageSize)
                .ToListAsync(ct);

            var list = new List<Category>(docs.Count);
            foreach (var d in docs)
                list.Add(MapCategory(d));
            return list;
        }

        public async Task<IReadOnlyList<Category>> GetByIdsAsync(IReadOnlyCollection<string> ids, CancellationToken ct)
        {
            if (ids.Count == 0) return [];

            var col = _col.Database.GetCollection<BsonDocument>("categories");
            var filter = Builders<BsonDocument>.Filter.Or(
                Builders<BsonDocument>.Filter.In("Id", ids),
                Builders<BsonDocument>.Filter.In("_id", ids)
            );

            var docs = await col.Find(filter)
                .Project(Builders<BsonDocument>.Projection.Include("Id").Include("Name").Include("Description"))
                .ToListAsync(ct);

            var list = new List<Category>(docs.Count);
            foreach (var d in docs)
                list.Add(MapCategory(d));
            return list;
        }

        private static Category MapCategory(BsonDocument doc)
        {
            var name = doc.GetValue("Name", BsonNull.Value).IsBsonNull ? string.Empty : doc["Name"].AsString;
            var desc = doc.GetValue("Description", BsonNull.Value).IsBsonNull ? string.Empty : doc["Description"].AsString;
            var c = new Category(name, desc);

            string id = doc.Contains("Id") && doc["Id"].BsonType == BsonType.String
                ? doc["Id"].AsString
                : doc.Contains("_id") ? doc["_id"].ToString() : string.Empty;

            typeof(Category).GetProperty(nameof(Category.Id), BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)!
                .SetValue(c, id);

            return c;
        }
    }
}
