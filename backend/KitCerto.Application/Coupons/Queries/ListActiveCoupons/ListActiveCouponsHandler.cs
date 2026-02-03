using System;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Coupons.Queries.ListActiveCoupons;

public sealed class ListActiveCouponsHandler : IRequestHandler<ListActiveCouponsQuery, IReadOnlyList<Domain.Coupons.Coupon>>
{
    private readonly ICouponsRepo _repo;
    public ListActiveCouponsHandler(ICouponsRepo repo) => _repo = repo;

    public Task<IReadOnlyList<Domain.Coupons.Coupon>> Handle(ListActiveCouponsQuery req, CancellationToken ct)
        => _repo.ListActiveAsync(DateTime.UtcNow, ct);
}
