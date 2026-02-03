using MediatR;
using System;

namespace KitCerto.Application.Coupons.Create;

public sealed record CreateCouponCmd(
    string Code,
    string? Description,
    string DiscountType,
    decimal DiscountValue,
    decimal MinOrderValue,
    DateTime ValidFrom,
    DateTime ValidUntil,
    int MaxUses
) : IRequest<string>;
