using System;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Favorites
{
    public sealed class UserFavorite
    {
        [BsonId]
        [BsonElement("Id")]
        public string Id { get; private set; } = string.Empty;

        [BsonElement("UserId")] public string UserId { get; private set; } = string.Empty;
        [BsonElement("ProductId")] public string ProductId { get; private set; } = string.Empty;
        [BsonElement("CreatedAtUtc")] public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

        public UserFavorite() { }

        public UserFavorite(string id, string userId, string productId)
        {
            Id = id;
            UserId = userId;
            ProductId = productId;
        }
    }
}
