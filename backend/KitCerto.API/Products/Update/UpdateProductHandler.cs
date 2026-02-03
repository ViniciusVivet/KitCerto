using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Products;
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
            if (!string.IsNullOrWhiteSpace(req.SellerIdForAuth))
            {
                var product = await _repo.GetByIdAsync(req.Id, ct);
                if (product is null) throw new InvalidOperationException("Produto não encontrado.");
                if (product.SellerId != req.SellerIdForAuth)
                    throw new UnauthorizedAccessException("Produto não pertence à sua loja.");
            }
            var media = (req.Media ?? new List<UpdateProductMedia>())
                .Select(m => new ProductMedia(m.Url, m.Type))
                .ToList();
            await _repo.UpdateAsync(req.Id, req.Name, req.Description, req.Price, req.Stock, req.Quantity, req.CategoryId, media, ct);
        }
    }
}
