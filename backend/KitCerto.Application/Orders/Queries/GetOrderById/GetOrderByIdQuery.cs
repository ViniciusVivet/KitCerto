using MediatR;
using KitCerto.Application.Orders.Queries.ListOrders;

namespace KitCerto.Application.Orders.Queries.GetOrderById
{
    public sealed record GetOrderByIdQuery(string UserId, string OrderId) : IRequest<OrderDto?>;
}
