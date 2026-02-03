using System;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Addresses
{
    public sealed class Address
    {
        [BsonId]
        [BsonElement("Id")]
        public string Id { get; private set; } = string.Empty;

        [BsonElement("UserId")] public string UserId { get; private set; } = string.Empty;
        [BsonElement("Label")] public string? Label { get; private set; }
        [BsonElement("Street")] public string Street { get; private set; } = string.Empty;
        [BsonElement("Number")] public string Number { get; private set; } = string.Empty;
        [BsonElement("Complement")] public string? Complement { get; private set; }
        [BsonElement("Neighborhood")] public string Neighborhood { get; private set; } = string.Empty;
        [BsonElement("City")] public string City { get; private set; } = string.Empty;
        [BsonElement("State")] public string State { get; private set; } = string.Empty;
        [BsonElement("ZipCode")] public string ZipCode { get; private set; } = string.Empty;
        [BsonElement("IsDefault")] public bool IsDefault { get; private set; }
        [BsonElement("CreatedAtUtc")] public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
        [BsonElement("UpdatedAtUtc")] public DateTime UpdatedAtUtc { get; private set; } = DateTime.UtcNow;

        public Address() { }

        public Address(string id, string userId, string? label, string street, string number, string? complement, string neighborhood, string city, string state, string zipCode, bool isDefault)
        {
            Id = id;
            UserId = userId;
            Label = label;
            Street = street;
            Number = number;
            Complement = complement;
            Neighborhood = neighborhood;
            City = city;
            State = state;
            ZipCode = zipCode;
            IsDefault = isDefault;
        }

        public void Update(string? label, string street, string number, string? complement, string neighborhood, string city, string state, string zipCode)
        {
            Label = label;
            Street = street;
            Number = number;
            Complement = complement;
            Neighborhood = neighborhood;
            City = city;
            State = state;
            ZipCode = zipCode;
            UpdatedAtUtc = DateTime.UtcNow;
        }

        public void SetDefault(bool isDefault)
        {
            IsDefault = isDefault;
            UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}
