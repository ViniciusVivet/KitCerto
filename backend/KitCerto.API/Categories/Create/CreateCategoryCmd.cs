using MediatR;

namespace KitCerto.Application.Categories.Create;

public sealed record CreateCategoryCmd(
    string Name,
    string Description
) : IRequest<string>;
