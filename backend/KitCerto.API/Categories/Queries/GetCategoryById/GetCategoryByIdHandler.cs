using KitCerto.Domain.Categories;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Categories.Queries.GetCategoryById;

public sealed class GetCategoryByIdHandler : IRequestHandler<GetCategoryByIdQuery, Category?>
{
    private readonly ICategoriesRepo _repo;
    public GetCategoryByIdHandler(ICategoriesRepo repo) => _repo = repo;

    public Task<Category?> Handle(GetCategoryByIdQuery req, CancellationToken ct) =>
        _repo.GetByIdAsync(req.Id, ct);
}
