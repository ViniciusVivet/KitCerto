using KitCerto.Domain.Categories;
using MediatR;

namespace KitCerto.Application.Categories.Queries.ListCategories;

public sealed record ListCategoriesQuery(int Page, int PageSize) : IRequest<IReadOnlyList<Category>>;
