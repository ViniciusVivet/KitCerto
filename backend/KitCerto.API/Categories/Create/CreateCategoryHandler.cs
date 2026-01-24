using System;
using System.Reflection;
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
        var id = $"cat-{Guid.NewGuid():N}";
        typeof(Category).GetProperty(nameof(Category.Id), BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)!
            .SetValue(category, id);
        await _repo.CreateAsync(category, ct);
        return id;
    }
}
