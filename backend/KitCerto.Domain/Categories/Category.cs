namespace KitCerto.Domain.Categories;

public sealed class Category
{
    public string Id { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;

    public Category(string name, string description)
    {
        Name = name;
        Description = description;
    }
}
