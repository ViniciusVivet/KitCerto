using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace KitCerto.Domain.Categories;

public sealed class Category
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; private set; } = string.Empty;

    [BsonElement("Name")] public string Name { get; private set; } = string.Empty;
    [BsonElement("Description")] public string Description { get; private set; } = string.Empty;

    // Necessário para deserialização do MongoDB.Driver
    public Category() { }

    public Category(string name, string description)
    {
        Name = name;
        Description = description;
    }
}
