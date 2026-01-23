using System;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Sellers
{
    public sealed class SellerRequest
    {
        [BsonElement("Id")] public string Id { get; private set; } = string.Empty;
        [BsonElement("UserId")] public string UserId { get; private set; } = string.Empty;
        [BsonElement("Email")] public string Email { get; private set; } = string.Empty;
        [BsonElement("StoreName")] public string StoreName { get; private set; } = string.Empty;
        [BsonElement("Phone")] public string? Phone { get; private set; }
        [BsonElement("Description")] public string? Description { get; private set; }
        [BsonElement("Status")] public string Status { get; private set; } = "pending";
        [BsonElement("CreatedAtUtc")] public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
        [BsonElement("UpdatedAtUtc")] public DateTime? UpdatedAtUtc { get; private set; }

        public SellerRequest(string userId, string email, string storeName, string? phone, string? description)
        {
            Id = Guid.NewGuid().ToString("N");
            UserId = userId;
            Email = email;
            StoreName = storeName;
            Phone = phone;
            Description = description;
            Status = "pending";
            CreatedAtUtc = DateTime.UtcNow;
        }

        public SellerRequest() { }

        public void UpdateStatus(string status)
        {
            Status = status;
            UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}
