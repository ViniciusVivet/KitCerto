namespace KitCerto.Domain.Products;

public sealed class Product
{
    public string Id { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public string CategoryId { get; private set; } = string.Empty;
    public int Quantity { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    public Product(string name, string description, decimal price, string categoryId, int quantity)
    {
        Name = name;
        Description = description;
        Price = price;
        CategoryId = categoryId;
        Quantity = quantity;
    }
}
