using Microsoft.EntityFrameworkCore;
using MongoDB.EntityFrameworkCore.Extensions;
using KitCerto.Domain.Products;
using KitCerto.Domain.Categories;

namespace KitCerto.Infrastructure.Data;

public sealed class EfMongoDbContext : DbContext
{
    public EfMongoDbContext(DbContextOptions<EfMongoDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Collections
        modelBuilder.Entity<Product>().ToCollection("products");
        modelBuilder.Entity<Category>().ToCollection("categories");

        // Keys
        modelBuilder.Entity<Product>().HasKey(p => p.Id);
        modelBuilder.Entity<Category>().HasKey(c => c.Id);

        // Basic property mappings (nomes padrão do C# → campos do documento)
        // Caso os documentos usem "_id", considere ajustar para mapear Id → _id conforme suporte do provider.

        base.OnModelCreating(modelBuilder);
    }
}


