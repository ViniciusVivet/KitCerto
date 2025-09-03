using KitCerto.Domain.Categories;
using MediatR;

namespace KitCerto.Application.Categories.Queries.GetCategoryById;

public sealed record GetCategoryByIdQuery(string Id) : IRequest<Category?>;
