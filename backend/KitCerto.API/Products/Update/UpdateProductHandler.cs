using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Products.Update
{
    public sealed class UpdateProductHandler : IRequestHandler<UpdateProductCmd>
    {
        private readonly IProductsRepo _repo;
        public UpdateProductHandler(IProductsRepo repo) => _repo = repo;

        public async Task Handle(UpdateProductCmd req, CancellationToken ct)
        {
            await _repo.UpdateAsync(req.Id, req.Name, req.Description, req.Price, req.Stock, req.CategoryId, ct);
        }
    }
}
