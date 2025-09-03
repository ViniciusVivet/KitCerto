using KitCerto.Domain.Categories;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Categories.Create;

public sealed class CreateCategoryHandler : IRequestHandler<CreateCategoryCmd, string>
{
    private readonly ICategoriesRepo _repo;
    public CreateCategoryHandler(ICategoriesRepo repo) => _repo = repo;

    public async Task<string> Handle(CreateCategoryCmd req, CancellationToken ct)
    {
        var category = new Category(req.Name, req.Description);
        return await _repo.CreateAsync(category, ct);
    }
}
