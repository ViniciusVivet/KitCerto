using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;

using KitCerto.Infrastructure.Data;           // MongoContext / EfMongoDbContext
using KitCerto.Infrastructure.Repositories;  // Repos
using KitCerto.Domain.Repositories;          // IProductsRepo, ICategoriesRepo
using KitCerto.Domain.Payments;
using KitCerto.Infrastructure.Payments;

namespace KitCerto.Infrastructure.DependencyInjection
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
        {
            services.AddHttpClient("MercadoPago", client =>
            {
                client.BaseAddress = new Uri("https://api.mercadopago.com/");
                client.Timeout = TimeSpan.FromSeconds(15);
            });
            services.AddScoped<IPaymentGateway, MercadoPagoGateway>();

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
                services.AddScoped<ISellerRequestsRepo, MongoSellerRequestsRepo>();
                services.AddScoped<IOrdersRepo, MongoOrdersRepo>();
            }
            else
            {
                services.AddScoped<IProductsRepo, MongoProductsRepo>();
                services.AddScoped<ICategoriesRepo, MongoCategoriesRepo>();
                services.AddScoped<ISellerRequestsRepo, MongoSellerRequestsRepo>();
                services.AddScoped<IOrdersRepo, MongoOrdersRepo>();
            }

            return services;
        }
    }
}
