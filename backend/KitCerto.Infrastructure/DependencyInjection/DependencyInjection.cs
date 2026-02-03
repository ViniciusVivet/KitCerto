using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

using KitCerto.Infrastructure.Data;           // MongoContext
using KitCerto.Infrastructure.Repositories;  // Repos
using KitCerto.Domain.Repositories;          // IProductsRepo, IProfileRepo, IAddressRepo, IFavoritesRepo, ICouponsRepo, ISupportTicketsRepo, IPaymentMethodsRepo
using KitCerto.Domain.Payments;
using KitCerto.Domain.Support;               // INotifySellerService
using KitCerto.Infrastructure.Payments;
using KitCerto.Infrastructure.Support;      // LogNotifySellerService

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
            services.AddScoped<ISellersRepo, MongoSellersRepo>();
            services.AddScoped<IOrdersRepo, MongoOrdersRepo>();
            services.AddScoped<ISettingsRepo, MongoSettingsRepo>();
            services.AddScoped<IProfileRepo, MongoProfileRepo>();
            services.AddScoped<IAddressRepo, MongoAddressRepo>();
            services.AddScoped<IFavoritesRepo, MongoFavoritesRepo>();
            services.AddScoped<ICouponsRepo, MongoCouponsRepo>();
            services.AddScoped<ISupportTicketsRepo, MongoSupportTicketsRepo>();
            services.AddScoped<ITicketMessagesRepo, MongoTicketMessagesRepo>();
            services.AddScoped<IPaymentMethodsRepo, MongoPaymentMethodsRepo>();
            services.AddScoped<INotifySellerService, LogNotifySellerService>();

            return services;
        }
    }
}
