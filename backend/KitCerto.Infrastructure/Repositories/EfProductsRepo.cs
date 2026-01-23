using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KitCerto.Domain.Products;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;

namespace KitCerto.Infrastructure.Repositories;

public sealed class EfProductsRepo : IProductsRepo
{
    private readonly EfMongoDbContext _db;
    public EfProductsRepo(EfMongoDbContext db) => _db = db;

    public async Task<string> CreateAsync(Product p, CancellationToken ct)
    {
        await _db.Products.AddAsync(p, ct);
        await _db.SaveChangesAsync(ct);
        return p.Id;
    }

    public Task<Product?> GetByIdAsync(string id, CancellationToken ct)
        => _db.Products.AsQueryable().FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<Product>> ListAsync(int page, int pageSize, CancellationToken ct)
        => await _db.Products.AsQueryable()
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

    public async Task UpdateAsync(string id, string name, string description, decimal price, int stock, string categoryId, CancellationToken ct)
    {
        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return;
        // Produtos têm setters privados; usar construtor ou métodos apropriados caso existam.
        // Como atalho (sem quebrar Domain), recriar entidade e substituir valores rastreados.
        p.GetType().GetProperty(nameof(Product.Name))!.SetValue(p, name);
        p.GetType().GetProperty(nameof(Product.Description))!.SetValue(p, description);
        p.GetType().GetProperty(nameof(Product.Price))!.SetValue(p, price);
        p.GetType().GetProperty(nameof(Product.Stock))!.SetValue(p, stock);
        p.GetType().GetProperty(nameof(Product.CategoryId))!.SetValue(p, categoryId);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(string id, CancellationToken ct)
    {
        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return;
        _db.Products.Remove(p);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateStockAsync(string id, int stock, CancellationToken ct)
    {
        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return;
        p.GetType().GetProperty(nameof(Product.Stock))!.SetValue(p, stock);
        await _db.SaveChangesAsync(ct);
    }

    public Task<IReadOnlyList<Product>> ListLowStockAsync(int threshold, CancellationToken ct)
        => _db.Products.AsQueryable().Where(x => x.Stock < threshold).ToListAsync(ct)
            .ContinueWith(t => (IReadOnlyList<Product>)t.Result, ct);

    public async Task<IReadOnlyList<Product>> SearchAsync(string? name, string? categoryId, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.Products.AsQueryable();
        if (!string.IsNullOrWhiteSpace(name)) q = q.Where(x => x.Name.ToLower().Contains(name.ToLower()));
        if (!string.IsNullOrWhiteSpace(categoryId)) q = q.Where(x => x.CategoryId == categoryId);
        return await q.OrderBy(x => x.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
    }

    public async Task<long> CountAsync(string? name, string? categoryId, CancellationToken ct)
    {
        var q = _db.Products.AsQueryable();
        if (!string.IsNullOrWhiteSpace(name)) q = q.Where(x => x.Name.ToLower().Contains(name.ToLower()));
        if (!string.IsNullOrWhiteSpace(categoryId)) q = q.Where(x => x.CategoryId == categoryId);
        return await q.LongCountAsync(ct);
    }

    public Task<int> LowStockCountAsync(int threshold, CancellationToken ct)
        => _db.Products.AsQueryable().CountAsync(x => x.Stock < threshold, ct);

    public async Task<decimal> TotalStockValueAsync(CancellationToken ct)
    {
        var sum = await _db.Products.AsQueryable().Select(x => x.Price * x.Stock).SumAsync(ct);
        return sum;
    }

    public async Task<IReadOnlyList<CategoryCount>> CountByCategoryAsync(CancellationToken ct)
    {
        var data = await _db.Products.AsQueryable()
            .GroupBy(x => x.CategoryId)
            .Select(g => new CategoryCount { CategoryId = g.Key, Count = g.Count() })
            .ToListAsync(ct);
        return data;
    }

    public async Task<IReadOnlyList<CategoryValue>> ValueByCategoryAsync(CancellationToken ct)
    {
        var data = await _db.Products.AsQueryable()
            .GroupBy(x => x.CategoryId)
            .Select(g => new CategoryValue { CategoryId = g.Key, TotalValue = g.Sum(x => x.Price * x.Stock) })
            .ToListAsync(ct);
        return data;
    }

    public async Task<IReadOnlyList<Product>> TopProductsByValueAsync(int limit, CancellationToken ct)
    {
        return await _db.Products.AsQueryable()
            .OrderByDescending(x => x.Price * x.Stock)
            .Take(limit)
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
            var count = await _db.Products.AsQueryable()
                .CountAsync(x => x.Price >= range.Min && x.Price < range.Max, ct);
            buckets.Add(new PriceBucket { Range = range.Label, Count = count });
        }

        return buckets;
    }

    public async Task<IReadOnlyList<Product>> LowStockItemsAsync(int threshold, CancellationToken ct)
    {
        return await _db.Products.AsQueryable()
            .Where(x => x.Stock < threshold)
            .ToListAsync(ct);
    }
}


