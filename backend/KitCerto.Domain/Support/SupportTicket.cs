using System;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Support
{
    public sealed class SupportTicket
    {
        [BsonId]
        [BsonElement("Id")]
        public string Id { get; private set; } = string.Empty;

        [BsonElement("UserId")] public string UserId { get; private set; } = string.Empty;
        [BsonElement("Subject")] public string Subject { get; private set; } = string.Empty;
        [BsonElement("Message")] public string Message { get; private set; } = string.Empty;
        [BsonElement("Status")] public string Status { get; private set; } = "open"; // open, in_progress, closed
        [BsonElement("OrderId")] public string? OrderId { get; private set; }
        [BsonElement("SellerId")] public string? SellerId { get; private set; }
        [BsonElement("CreatedAtUtc")] public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
        [BsonElement("UpdatedAtUtc")] public DateTime UpdatedAtUtc { get; private set; } = DateTime.UtcNow;

        public SupportTicket() { }

        public SupportTicket(string id, string userId, string subject, string message, string? orderId = null, string? sellerId = null)
        {
            Id = id;
            UserId = userId;
            Subject = subject;
            Message = message;
            OrderId = orderId;
            SellerId = sellerId;
        }
    }

    public sealed class TicketMessage
    {
        [BsonId]
        [BsonElement("Id")]
        public string Id { get; private set; } = string.Empty;

        [BsonElement("TicketId")] public string TicketId { get; private set; } = string.Empty;
        [BsonElement("SenderUserId")] public string SenderUserId { get; private set; } = string.Empty; // userId do cliente ou do admin/suporte
        [BsonElement("Message")] public string Message { get; private set; } = string.Empty;
        [BsonElement("CreatedAtUtc")] public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

        public TicketMessage() { }

        public TicketMessage(string id, string ticketId, string senderUserId, string message)
        {
            Id = id;
            TicketId = ticketId;
            SenderUserId = senderUserId;
            Message = message;
        }
    }
}
