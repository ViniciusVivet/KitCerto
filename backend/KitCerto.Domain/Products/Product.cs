using System;
using System.Collections.Generic;
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

        [BsonElement("Media")] public List<ProductMedia> Media { get; private set; } = new();

        // 👇 Agora o construtor aceita 6 argumentos (incluindo stock)
        public Product(
            string name,
            string description,
            decimal price,
            string categoryId,
            int quantity,
            int stock)
            : this(name, description, price, categoryId, quantity, stock, new List<ProductMedia>())
        {
        }

        public Product(
            string name,
            string description,
            decimal price,
            string categoryId,
            int quantity,
            int stock,
            List<ProductMedia> media)
        {
            Name        = name;
            Description = description;
            Price       = price;
            CategoryId  = categoryId;
            Quantity    = quantity;
            Stock       = stock;
            Media       = media ?? new List<ProductMedia>();
        }

        // Necessário para deserialização do MongoDB.Driver / EF Mongo
        public Product() { }
    }

    public sealed class ProductMedia
    {
        [BsonElement("Url")] public string Url { get; private set; } = string.Empty;
        [BsonElement("Type")] public string Type { get; private set; } = "image";

        public ProductMedia(string url, string type)
        {
            Url = url;
            Type = type;
        }

        public ProductMedia() { }
    }
}
