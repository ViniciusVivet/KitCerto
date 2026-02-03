using MediatR;
using System.Collections.Generic;
using KitCerto.Domain.Coupons;

namespace KitCerto.Application.Coupons.Queries.ListActiveCoupons;

public sealed record ListActiveCouponsQuery() : IRequest<IReadOnlyList<Coupon>>;
