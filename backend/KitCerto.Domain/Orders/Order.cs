using System;
using System.Collections.Generic;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Orders
{
    public sealed class Order
    {
        [BsonElement("Id")] public string Id { get; private set; } = string.Empty;
        [BsonElement("UserId")] public string UserId { get; private set; } = string.Empty;
        [BsonElement("Status")] public string Status { get; private set; } = "pending_payment";
        [BsonElement("Currency")] public string Currency { get; private set; } = "BRL";
        [BsonElement("TotalAmount")] public decimal TotalAmount { get; private set; }
        [BsonElement("CreatedAtUtc")] public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
        [BsonElement("UpdatedAtUtc")] public DateTime UpdatedAtUtc { get; private set; } = DateTime.UtcNow;

        [BsonElement("PaymentProvider")] public string? PaymentProvider { get; private set; }
        [BsonElement("PaymentPreferenceId")] public string? PaymentPreferenceId { get; private set; }

        [BsonElement("Items")] public List<OrderItem> Items { get; private set; } = new();
        [BsonElement("Shipping")] public OrderShipping? Shipping { get; private set; }

        public Order(string id, string userId, string currency, decimal totalAmount, List<OrderItem> items, OrderShipping? shipping)
        {
            Id = id;
            UserId = userId;
            Currency = currency;
            TotalAmount = totalAmount;
            Items = items;
            Shipping = shipping;
        }

        public Order() { }

        public void SetPayment(string provider, string preferenceId)
        {
            PaymentProvider = provider;
            PaymentPreferenceId = preferenceId;
            UpdatedAtUtc = DateTime.UtcNow;
        }

        public void SetStatus(string status)
        {
            Status = status;
            UpdatedAtUtc = DateTime.UtcNow;
        }
    }

    public sealed class OrderItem
    {
        [BsonElement("ProductId")] public string ProductId { get; private set; } = string.Empty;
        [BsonElement("Name")] public string Name { get; private set; } = string.Empty;
        [BsonElement("UnitPrice")] public decimal UnitPrice { get; private set; }
        [BsonElement("Quantity")] public int Quantity { get; private set; }

        public OrderItem(string productId, string name, decimal unitPrice, int quantity)
        {
            ProductId = productId;
            Name = name;
            UnitPrice = unitPrice;
            Quantity = quantity;
        }

        public OrderItem() { }
    }

    public sealed class OrderShipping
    {
        [BsonElement("AddressLine")] public string AddressLine { get; private set; } = string.Empty;
        [BsonElement("City")] public string City { get; private set; } = string.Empty;
        [BsonElement("State")] public string State { get; private set; } = string.Empty;

        public OrderShipping(string addressLine, string city, string state)
        {
            AddressLine = addressLine;
            City = city;
            State = state;
        }

        public OrderShipping() { }
    }
}
