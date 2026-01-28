using System.Collections.Generic;
using KitCerto.Application.Orders.Queries.ListOrders;
using MediatR;

namespace KitCerto.Application.Orders.Queries.ListAllOrders
{
    public sealed record ListAllOrdersQuery() : IRequest<IReadOnlyList<OrderDto>>;
}
