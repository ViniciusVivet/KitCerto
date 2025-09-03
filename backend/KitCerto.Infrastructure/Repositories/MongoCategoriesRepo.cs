using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Categories;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;

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
            var filter = Builders<Category>.Filter.Eq(x => x.Id, id);
            return await _col.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<IReadOnlyList<Category>> ListAsync(int page, int pageSize, CancellationToken ct)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 20;

            var skip = (page - 1) * pageSize;

            return await _col.Find(FilterDefinition<Category>.Empty)
                             .Skip(skip)
                             .Limit(pageSize)
                             .ToListAsync(ct);
        }
    }
}
