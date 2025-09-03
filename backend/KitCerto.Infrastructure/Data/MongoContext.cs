using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace KitCerto.Infrastructure.Data
{
    public sealed class MongoContext
    {
        public IMongoDatabase Db { get; }

        public MongoContext(IMongoClient client, IConfiguration cfg)
        {
            var dbName = cfg["Database:Name"];
            if (string.IsNullOrWhiteSpace(dbName))
                dbName = "kitcerto";

            Db = client.GetDatabase(dbName);
        }
    }
}
