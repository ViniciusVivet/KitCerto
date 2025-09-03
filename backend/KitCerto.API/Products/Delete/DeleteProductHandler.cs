using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Products.Delete
{
    public sealed class DeleteProductHandler : IRequestHandler<DeleteProductCmd>
    {
        private readonly IProductsRepo _repo;
        public DeleteProductHandler(IProductsRepo repo) => _repo = repo;

        public async Task Handle(DeleteProductCmd req, CancellationToken ct)
        {
            await _repo.DeleteAsync(req.Id, ct);
        }
    }
}
