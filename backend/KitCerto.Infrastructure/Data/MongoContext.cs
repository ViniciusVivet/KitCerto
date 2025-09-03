using MongoDB.Driver;

namespace KitCerto.Infrastructure.Data;

public sealed class MongoContext
{
    // O repo espera "Db", então vamos expor com esse nome.
    public IMongoDatabase Db { get; }

    public MongoContext(string connString)
    {
        // Ex.: "mongodb://localhost:27017/kitcerto"
        var url = new MongoUrl(connString);
        var client = new MongoClient(url);

        var dbName = url.DatabaseName ?? "kitcerto"; // fallback
        Db = client.GetDatabase(dbName);
    }
}
