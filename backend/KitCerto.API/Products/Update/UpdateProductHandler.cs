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
            var media = (req.Media ?? Array.Empty<UpdateProductMedia>())
                .Select(m => new ProductMedia(m.Url, m.Type))
                .ToList();
            await _repo.UpdateAsync(req.Id, req.Name, req.Description, req.Price, req.Stock, req.CategoryId, media, ct);
        }
    }
}
