using MongoDB.Driver;
using KitCerto.Domain;

public interface IProductsRepo {
  Task<string> CreateAsync(Product p, CancellationToken ct);
  // (restante: update/delete/get/list)
}

public sealed class MongoContext {
  public IMongoDatabase Db { get; }
  public MongoContext(string conn) {
    var client = new MongoClient(conn);
    Db = client.GetDatabase("kitcerto");
  }
}
