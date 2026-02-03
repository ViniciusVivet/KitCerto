using System;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Coupons
{
    public sealed class Coupon
    {
        [BsonId]
        [BsonElement("Id")]
        public string Id { get; private set; } = string.Empty;

        [BsonElement("Code")] public string Code { get; private set; } = string.Empty;
        [BsonElement("Description")] public string? Description { get; private set; }
        [BsonElement("DiscountType")] public string DiscountType { get; private set; } = "percent"; // "percent" | "fixed"
        [BsonElement("DiscountValue")] public decimal DiscountValue { get; private set; }
        [BsonElement("MinOrderValue")] public decimal MinOrderValue { get; private set; }
        [BsonElement("ValidFrom")] public DateTime ValidFrom { get; private set; }
        [BsonElement("ValidUntil")] public DateTime ValidUntil { get; private set; }
        [BsonElement("MaxUses")] public int MaxUses { get; private set; }
        [BsonElement("UsedCount")] public int UsedCount { get; private set; }
        [BsonElement("CreatedAtUtc")] public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

        public Coupon() { }

        public Coupon(string id, string code, string? description, string discountType, decimal discountValue, decimal minOrderValue, DateTime validFrom, DateTime validUntil, int maxUses)
        {
            Id = id;
            Code = code;
            Description = description;
            DiscountType = discountType;
            DiscountValue = discountValue;
            MinOrderValue = minOrderValue;
            ValidFrom = validFrom;
            ValidUntil = validUntil;
            MaxUses = maxUses;
        }

        public bool IsActive(DateTime at)
        {
            return at >= ValidFrom && at <= ValidUntil && (MaxUses <= 0 || UsedCount < MaxUses);
        }
    }
}
