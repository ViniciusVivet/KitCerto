using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Categories.Delete
{
    public sealed class DeleteCategoryHandler : IRequestHandler<DeleteCategoryCmd>
    {
        private readonly ICategoriesRepo _repo;
        public DeleteCategoryHandler(ICategoriesRepo repo) => _repo = repo;

        public async Task Handle(DeleteCategoryCmd req, CancellationToken ct)
        {
            await _repo.DeleteAsync(req.Id, ct);
        }
    }
}
