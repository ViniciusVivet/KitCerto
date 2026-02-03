using System.Collections.Generic;
using MediatR;
using KitCerto.Application.Orders.Queries.ListOrders;

namespace KitCerto.Application.Orders.Queries.ListOrdersForSeller;

public sealed record ListOrdersForSellerQuery(string UserId) : IRequest<IReadOnlyList<OrderDto>>;
