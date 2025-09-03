using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Products;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Products.Queries.ListProducts
{
    public sealed class ListProductsHandler : IRequestHandler<ListProductsQuery, IReadOnlyList<Product>>
    {
        private readonly IProductsRepo _repo;
        public ListProductsHandler(IProductsRepo repo) => _repo = repo;

        public Task<IReadOnlyList<Product>> Handle(ListProductsQuery request, CancellationToken ct)
            => _repo.ListAsync(request.Page, request.PageSize, ct);
    }
}
