using KitCerto.Domain.Categories;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Categories.Queries.ListCategories;

public sealed class ListCategoriesHandler : IRequestHandler<ListCategoriesQuery, IReadOnlyList<Category>>
{
    private readonly ICategoriesRepo _repo;
    public ListCategoriesHandler(ICategoriesRepo repo) => _repo = repo;

    public Task<IReadOnlyList<Category>> Handle(ListCategoriesQuery req, CancellationToken ct) =>
        _repo.ListAsync(req.Page, req.PageSize, ct);
}
