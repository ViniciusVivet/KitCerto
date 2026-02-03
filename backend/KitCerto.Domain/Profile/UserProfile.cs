using System;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Profile
{
    public sealed class UserProfile
    {
        [BsonId]
        [BsonElement("UserId")]
        public string UserId { get; private set; } = string.Empty;

        [BsonElement("DisplayName")] public string? DisplayName { get; private set; }
        [BsonElement("FullName")] public string? FullName { get; private set; }
        [BsonElement("Phone")] public string? Phone { get; private set; }
        [BsonElement("AvatarUrl")] public string? AvatarUrl { get; private set; }
        [BsonElement("BirthDate")] public DateTime? BirthDate { get; private set; }
        [BsonElement("Document")] public string? Document { get; private set; }
        [BsonElement("NewsletterOptIn")] public bool NewsletterOptIn { get; private set; }
        [BsonElement("MpCustomerId")] public string? MpCustomerId { get; private set; }
        [BsonElement("UpdatedAtUtc")] public DateTime UpdatedAtUtc { get; private set; } = DateTime.UtcNow;

        public UserProfile() { }

        public UserProfile(string userId, string? displayName, string? fullName, string? phone, string? avatarUrl, DateTime? birthDate, string? document, bool newsletterOptIn)
        {
            UserId = userId;
            DisplayName = displayName;
            FullName = fullName;
            Phone = phone;
            AvatarUrl = avatarUrl;
            BirthDate = birthDate;
            Document = document;
            NewsletterOptIn = newsletterOptIn;
        }

        public void Update(string? displayName, string? fullName, string? phone, string? avatarUrl, DateTime? birthDate, string? document, bool newsletterOptIn)
        {
            DisplayName = displayName;
            FullName = fullName;
            Phone = phone;
            AvatarUrl = avatarUrl;
            BirthDate = birthDate;
            Document = document;
            NewsletterOptIn = newsletterOptIn;
            UpdatedAtUtc = DateTime.UtcNow;
        }

        public void SetMpCustomerId(string? mpCustomerId)
        {
            MpCustomerId = mpCustomerId;
            UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}
