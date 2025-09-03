using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Products;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Products.Queries.GetProductById
{
    public sealed class GetProductByIdHandler : IRequestHandler<GetProductByIdQuery, Product?>
    {
        private readonly IProductsRepo _repo;
        public GetProductByIdHandler(IProductsRepo repo) => _repo = repo;

        public Task<Product?> Handle(GetProductByIdQuery request, CancellationToken ct)
            => _repo.GetByIdAsync(request.Id, ct);
    }
}
