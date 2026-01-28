using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

using KitCerto.Infrastructure.Data;           // MongoContext
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

            // Repositórios usando MongoDB Driver Nativo
            services.AddScoped<IProductsRepo, MongoProductsRepo>();
            services.AddScoped<ICategoriesRepo, MongoCategoriesRepo>();
            services.AddScoped<ISellerRequestsRepo, MongoSellerRequestsRepo>();
            services.AddScoped<IOrdersRepo, MongoOrdersRepo>();

            return services;
        }
    }
}
