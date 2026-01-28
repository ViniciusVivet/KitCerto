using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Categories.Update
{
    public sealed class UpdateCategoryHandler : IRequestHandler<UpdateCategoryCmd>
    {
        private readonly ICategoriesRepo _repo;
        public UpdateCategoryHandler(ICategoriesRepo repo) => _repo = repo;

        public async Task Handle(UpdateCategoryCmd req, CancellationToken ct)
        {
            await _repo.UpdateAsync(req.Id, req.Name, req.Description, ct);
        }
    }
}
