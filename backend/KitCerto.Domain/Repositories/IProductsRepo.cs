using KitCerto.Domain;

public interface IProductsRepo {
    Task<string> CreateAsync(Product p, CancellationToken ct);
    // (restante: update/delete/get/list)
}