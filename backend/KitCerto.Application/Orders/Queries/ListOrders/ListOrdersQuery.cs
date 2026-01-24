using System.Collections.Generic;
using MediatR;

namespace KitCerto.Application.Orders.Queries.ListOrders
{
    public sealed record ListOrdersQuery(string UserId) : IRequest<IReadOnlyList<OrderDto>>;

    public sealed record OrderDto(
        string Id,
        string Status,
        string Currency,
        decimal TotalAmount,
        string CreatedAtUtc,
        IReadOnlyList<OrderItemDto> Items,
        OrderShippingDto? Shipping
    );

    public sealed record OrderItemDto(
        string ProductId,
        string Name,
        decimal UnitPrice,
        int Quantity
    );

    public sealed record OrderShippingDto(
        string AddressLine,
        string City,
        string State
    );
}
