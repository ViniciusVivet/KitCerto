using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Products;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Products.Queries.ListLowStock
{
    public sealed class ListLowStockProductsHandler : IRequestHandler<ListLowStockProductsQuery, IReadOnlyList<Product>>
    {
        private readonly IProductsRepo _repo;
        public ListLowStockProductsHandler(IProductsRepo repo) => _repo = repo;

        public async Task<IReadOnlyList<Product>> Handle(ListLowStockProductsQuery req, CancellationToken ct)
            => await _repo.ListLowStockAsync(req.Threshold, ct);
    }
}
