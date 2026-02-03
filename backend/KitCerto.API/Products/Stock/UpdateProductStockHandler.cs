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
            if (!string.IsNullOrWhiteSpace(req.SellerIdForAuth))
            {
                var product = await _repo.GetByIdAsync(req.Id, ct);
                if (product is null) throw new InvalidOperationException("Produto não encontrado.");
                if (product.SellerId != req.SellerIdForAuth)
                    throw new UnauthorizedAccessException("Produto não pertence à sua loja.");
            }
            await _repo.UpdateStockAsync(req.Id, req.Stock, ct);
        }
    }
}
