using MediatR;

namespace KitCerto.Application.Categories.Delete
{
    public sealed record DeleteCategoryCmd(string Id) : IRequest;
}
