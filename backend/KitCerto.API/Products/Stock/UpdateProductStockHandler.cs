using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Products.Stock
{
    public sealed class UpdateProductStockHandler : IRequestHandler<UpdateProductStockCmd>
    {
        private readonly IProductsRepo _repo;
        public UpdateProductStockHandler(IProductsRepo repo) => _repo = repo;

        public async Task Handle(UpdateProductStockCmd req, CancellationToken ct)
        {
            await _repo.UpdateStockAsync(req.Id, req.Stock, ct);
        }
    }
}
