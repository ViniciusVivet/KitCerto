using KitCerto.Domain.Products;
using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using MongoDB.Driver;


namespace KitCerto.Infrastructure.Repositories;

public sealed class MongoProductsRepo : IProductsRepo
{
    private readonly IMongoCollection<Product> _col;
    public MongoProductsRepo(MongoContext ctx) => _col = ctx.Db.GetCollection<Product>("products");

    public async Task<string> CreateAsync(Product p, CancellationToken ct)
    {
        await _col.InsertOneAsync(p, cancellationToken: ct);
        return p.Id;
    }
}
