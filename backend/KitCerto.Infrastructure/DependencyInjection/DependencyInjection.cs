using KitCerto.Domain.Repositories;
using KitCerto.Infrastructure.Data;
using KitCerto.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KitCerto.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
    {
        var conn = cfg.GetConnectionString("Mongo")!;
        services.AddSingleton(new MongoContext(conn));
        services.AddScoped<IProductsRepo, MongoProductsRepo>();
        return services;
    }
}
