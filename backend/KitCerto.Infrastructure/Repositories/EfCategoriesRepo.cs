using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KitCerto.Domain.Categories;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;

namespace KitCerto.Infrastructure.Repositories;

public sealed class EfCategoriesRepo : ICategoriesRepo
{
    private readonly EfMongoDbContext _db;
    public EfCategoriesRepo(EfMongoDbContext db) => _db = db;

    public async Task<string> CreateAsync(Category c, CancellationToken ct)
    {
        await _db.Categories.AddAsync(c, ct);
        await _db.SaveChangesAsync(ct);
        return c.Id;
    }

    public Task<Category?> GetByIdAsync(string id, CancellationToken ct)
        => _db.Categories.AsQueryable().FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<Category>> ListAsync(int page, int pageSize, CancellationToken ct)
        => await _db.Categories.AsQueryable()
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
}


