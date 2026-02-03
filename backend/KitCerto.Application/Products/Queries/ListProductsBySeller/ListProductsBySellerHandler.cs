using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Products.Queries.ListProductsBySeller;

public sealed class ListProductsBySellerHandler : IRequestHandler<ListProductsBySellerQuery, ListProductsBySellerResult>
{
    private readonly IProductsRepo _repo;

    public ListProductsBySellerHandler(IProductsRepo repo) => _repo = repo;

    public async Task<ListProductsBySellerResult> Handle(ListProductsBySellerQuery req, CancellationToken ct)
    {
        var items = await _repo.ListBySellerIdAsync(req.SellerId, req.Page, req.PageSize, ct);
        var total = await _repo.CountBySellerIdAsync(req.SellerId, ct);
        return new ListProductsBySellerResult(items, total);
    }
}
