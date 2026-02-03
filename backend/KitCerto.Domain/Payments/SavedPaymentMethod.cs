using System;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Payments
{
    public sealed class SavedPaymentMethod
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.String)]
        public string Id { get; private set; } = string.Empty;

        [BsonElement("UserId")] public string UserId { get; private set; } = string.Empty;
        [BsonElement("MpCardId")] public string MpCardId { get; private set; } = string.Empty;
        [BsonElement("Last4")] public string Last4 { get; private set; } = string.Empty;
        [BsonElement("Brand")] public string Brand { get; private set; } = string.Empty;
        [BsonElement("IsDefault")] public bool IsDefault { get; private set; }
        [BsonElement("CreatedAtUtc")] public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

        public SavedPaymentMethod() { }

        public SavedPaymentMethod(string id, string userId, string mpCardId, string last4, string brand, bool isDefault)
        {
            Id = id;
            UserId = userId;
            MpCardId = mpCardId;
            Last4 = last4;
            Brand = brand;
            IsDefault = isDefault;
        }
    }
}
