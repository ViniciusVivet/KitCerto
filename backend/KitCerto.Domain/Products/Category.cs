namespace Kitcerto.Domain.Products;

public sealed class Category
{
    public string Id { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public Category(string name) { Name = name; }
}