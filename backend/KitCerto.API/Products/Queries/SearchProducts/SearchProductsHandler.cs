using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Products.Queries.SearchProducts
{
    public sealed class SearchProductsHandler : IRequestHandler<SearchProductsQuery, SearchProductsResult>
    {
        private readonly IProductsRepo _repo;

        public SearchProductsHandler(IProductsRepo repo) => _repo = repo;

        public async Task<SearchProductsResult> Handle(SearchProductsQuery req, CancellationToken ct)
        {
            var items = await _repo.SearchAsync(req.Name, req.CategoryId, req.Page, req.PageSize, ct);
            var total = await _repo.CountAsync(req.Name, req.CategoryId, ct);

            return new SearchProductsResult(items, total, req.Page, req.PageSize);
        }
    }
}
