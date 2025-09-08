using System;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Products
{
    public sealed class Product
    {
        [BsonElement("Id")] public string Id { get; private set; } = string.Empty;

        [BsonElement("Name")] public string Name { get; private set; } = string.Empty;
        [BsonElement("Description")] public string Description { get; private set; } = string.Empty;

        [BsonElement("Price")] public decimal Price { get; private set; }

        [BsonElement("CategoryId")] public string CategoryId { get; private set; } = string.Empty;

        [BsonElement("Quantity")] public int Quantity { get; private set; }

        [BsonElement("Stock")] public int Stock { get; private set; }

        [BsonElement("CreatedAtUtc")] public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

        // 👇 Agora o construtor aceita 6 argumentos (incluindo stock)
        public Product(
            string name,
            string description,
            decimal price,
            string categoryId,
            int quantity,
            int stock)
        {
            Name        = name;
            Description = description;
            Price       = price;
            CategoryId  = categoryId;
            Quantity    = quantity;
            Stock       = stock;
        }

        // Necessário para deserialização do MongoDB.Driver / EF Mongo
        public Product() { }
    }
}
