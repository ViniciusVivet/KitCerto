using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

using KitCerto.Infrastructure.Data;           // MongoContext
using KitCerto.Infrastructure.Repositories;  // MongoProductsRepo, MongoCategoriesRepo
using KitCerto.Domain.Repositories;          // IProductsRepo, ICategoriesRepo

namespace KitCerto.Infrastructure.DependencyInjection
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
        {
            // MongoClient singleton
            services.AddSingleton<IMongoClient>(sp =>
            {
                var cs = cfg.GetConnectionString("Mongo")!;
                return new MongoClient(cs);
            });

            // MongoContext singleton (reutiliza o IMongoClient)
            services.AddSingleton(sp =>
            {
                var client = sp.GetRequiredService<IMongoClient>();
                return new MongoContext(client, cfg);
            });

            // Repos
            services.AddScoped<IProductsRepo,    MongoProductsRepo>();
            services.AddScoped<ICategoriesRepo,  MongoCategoriesRepo>();

            return services;
        }
    }
}
