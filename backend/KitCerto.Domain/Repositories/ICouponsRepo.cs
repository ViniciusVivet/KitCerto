using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Coupons;

namespace KitCerto.Domain.Repositories
{
    public interface ICouponsRepo
    {
        Task<IReadOnlyList<Coupon>> ListActiveAsync(DateTime at, CancellationToken ct);
        Task<Coupon?> GetByCodeAsync(string code, CancellationToken ct);
        Task<Coupon> CreateAsync(Coupon coupon, CancellationToken ct);
        Task IncrementUsedCountAsync(string couponId, CancellationToken ct);
    }
}
