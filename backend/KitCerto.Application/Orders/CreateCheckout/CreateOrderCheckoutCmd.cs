using System.Collections.Generic;
using MediatR;

namespace KitCerto.Application.Orders.CreateCheckout
{
    public sealed record CreateOrderCheckoutCmd(
        string UserId,
        string? PayerEmail,
        IReadOnlyList<CreateOrderItem> Items,
        CreateOrderShipping? Shipping,
        string Currency,
        string SuccessUrl,
        string FailureUrl,
        string PendingUrl,
        string? CouponCode = null
    ) : IRequest<CreateOrderCheckoutResult>;

    public sealed record CreateOrderItem(string ProductId, int Quantity);

    public sealed record CreateOrderShipping(string AddressLine, string City, string State);

    public sealed record CreateOrderCheckoutResult(
        bool Success,
        string? ErrorCode,
        string? ErrorMessage,
        string? OrderId,
        string? CheckoutUrl,
        decimal TotalAmount,
        string Currency
    );
}
