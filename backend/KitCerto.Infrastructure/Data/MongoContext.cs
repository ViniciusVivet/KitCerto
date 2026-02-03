using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using MongoDB.Bson;

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
            
            // Criar índices para otimizar queries (alta prioridade)
            EnsureIndexes();
        }

        private void EnsureIndexes()
        {
            try
            {
                // ========== PRODUCTS COLLECTION ==========
                var productsCollection = Db.GetCollection<BsonDocument>("products");
                
                // Alta Prioridade: CategoryId - usado em SearchAsync, CountAsync, agregações
                var categoryIdIndex = new CreateIndexModel<BsonDocument>(
                    new BsonDocument("CategoryId", 1),
                    new CreateIndexOptions { Name = "idx_categoryid", Background = true }
                );
                
                // Alta Prioridade: Stock - usado em LowStockCountAsync, ListLowStockAsync
                var stockIndex = new CreateIndexModel<BsonDocument>(
                    new BsonDocument("Stock", 1),
                    new CreateIndexOptions { Name = "idx_stock", Background = true }
                );
                
                // Média Prioridade: Price - usado em PriceBucketsAsync
                var priceIndex = new CreateIndexModel<BsonDocument>(
                    new BsonDocument("Price", 1),
                    new CreateIndexOptions { Name = "idx_price", Background = true }
                );
                
                // Média Prioridade: Name - ajuda em busca por nome (Regex ainda funciona, mas mais rápido com índice)
                var nameIndex = new CreateIndexModel<BsonDocument>(
                    new BsonDocument("Name", 1),
                    new CreateIndexOptions { Name = "idx_name", Background = true }
                );
                
                productsCollection.Indexes.CreateMany(new[] { 
                    categoryIdIndex, 
                    stockIndex, 
                    priceIndex, 
                    nameIndex 
                });
                
                // ========== ORDERS COLLECTION ==========
                var ordersCollection = Db.GetCollection<BsonDocument>("orders");
                
                // Alta Prioridade: Composto UserId + CreatedAtUtc - usado em ListByUserAsync
                var userDateIndex = new CreateIndexModel<BsonDocument>(
                    new BsonDocument { { "UserId", 1 }, { "CreatedAtUtc", -1 } },
                    new CreateIndexOptions { Name = "idx_userid_createdat", Background = true }
                );
                
                // Média Prioridade: CreatedAtUtc - usado em ListAllAsync
                var createdAtIndex = new CreateIndexModel<BsonDocument>(
                    new BsonDocument("CreatedAtUtc", -1),
                    new CreateIndexOptions { Name = "idx_createdat", Background = true }
                );
                
                ordersCollection.Indexes.CreateMany(new[] { 
                    userDateIndex, 
                    createdAtIndex 
                });
            }
            catch (MongoCommandException ex) when (ex.CodeName == "IndexOptionsConflict" || ex.CodeName == "IndexKeySpecsConflict")
            {
                // Índice já existe com configuração diferente - não crítico
            }
            catch
            {
                // Erro ao criar índices - não crítico, aplicação continua funcionando
                // Em produção, considerar logar este erro
            }
        }
    }
}
