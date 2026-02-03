using System;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Coupons;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Coupons.Create;

public sealed class CreateCouponHandler : IRequestHandler<CreateCouponCmd, string>
{
    private readonly ICouponsRepo _repo;
    public CreateCouponHandler(ICouponsRepo repo) => _repo = repo;

    public async Task<string> Handle(CreateCouponCmd req, CancellationToken ct)
    {
        var existing = await _repo.GetByCodeAsync(req.Code, ct);
        if (existing != null)
            throw new InvalidOperationException($"Cupom com código '{req.Code}' já existe.");

        var id = Guid.NewGuid().ToString("N");
        var coupon = new Coupon(id, req.Code, req.Description, req.DiscountType, req.DiscountValue, req.MinOrderValue, req.ValidFrom, req.ValidUntil, req.MaxUses);
        await _repo.CreateAsync(coupon, ct);
        return id;
    }
}
