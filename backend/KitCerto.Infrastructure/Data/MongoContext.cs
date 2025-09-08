using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Data
{
    public sealed class MongoContext
    {
        public IMongoDatabase Db { get; }

        public MongoContext(IConfiguration cfg)
        {
            var cs = cfg.GetConnectionString("Mongo") ?? "mongodb://localhost:27017/kitcerto";
            var dbName = cfg["Mongo:DatabaseName"];
            if (string.IsNullOrWhiteSpace(dbName))
                dbName = "kitcerto";

            var client = new MongoClient(cs);
            Db = client.GetDatabase(dbName);
        }
    }
}
