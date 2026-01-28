using MediatR;

namespace KitCerto.Application.Categories.Update
{
    public sealed record UpdateCategoryCmd(
        string Id,
        string Name,
        string Description
    ) : IRequest;
}
