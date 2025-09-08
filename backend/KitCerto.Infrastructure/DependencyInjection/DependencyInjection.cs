using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;

using KitCerto.Infrastructure.Data;           // MongoContext / EfMongoDbContext
using KitCerto.Infrastructure.Repositories;  // Repos
using KitCerto.Domain.Repositories;          // IProductsRepo, ICategoriesRepo

namespace KitCerto.Infrastructure.DependencyInjection
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
        {
            // MongoContext singleton (agora cria o próprio MongoClient)
            services.AddSingleton(sp => new MongoContext(cfg));

            // Switch por configuração: Data:Provider = "efcore-mongo" ativa o provider EF Core
            var provider = cfg.GetValue<string>("Data:Provider")?.ToLowerInvariant();
            if (provider == "efcore-mongo")
            {
                var conn = cfg.GetConnectionString("Mongo")!;
                var dbName = cfg.GetValue<string>("Mongo:DatabaseName") ?? "kitcerto";
                services.AddDbContext<EfMongoDbContext>(opt => opt.UseMongoDB(conn, dbName));

                // Usa EF para produtos e Mongo driver para categorias (compatibilidade com campo "Id")
                services.AddScoped<IProductsRepo, EfProductsRepo>();
                services.AddScoped<ICategoriesRepo, MongoCategoriesRepo>();
            }
            else
            {
                services.AddScoped<IProductsRepo, MongoProductsRepo>();
                services.AddScoped<ICategoriesRepo, MongoCategoriesRepo>();
            }

            return services;
        }
    }
}
