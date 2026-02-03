using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Sellers
{
    /// <summary>Loja/vendedor aprovado na plataforma. Vinculado ao UserId (quem faz login como vendedor).</summary>
    public sealed class Seller
    {
        [BsonId]
        [BsonElement("Id")]
        public string Id { get; private set; } = string.Empty;

        [BsonElement("UserId")] public string UserId { get; private set; } = string.Empty;
        [BsonElement("StoreName")] public string StoreName { get; private set; } = string.Empty;
        [BsonElement("Email")] public string Email { get; private set; } = string.Empty;
        [BsonElement("Phone")] public string? Phone { get; private set; }
        [BsonElement("CreatedAtUtc")] public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

        public Seller() { }

        public Seller(string id, string userId, string storeName, string email, string? phone)
        {
            Id = id;
            UserId = userId;
            StoreName = storeName;
            Email = email;
            Phone = phone;
        }
    }
}
