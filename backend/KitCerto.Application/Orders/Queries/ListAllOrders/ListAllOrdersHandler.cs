using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using MediatR;
using KitCerto.Domain.Repositories;
using KitCerto.Application.Orders.Queries.ListOrders;

namespace KitCerto.Application.Orders.Queries.ListAllOrders
{
    public sealed class ListAllOrdersHandler : IRequestHandler<ListAllOrdersQuery, IReadOnlyList<OrderDto>>
    {
        private readonly IOrdersRepo _repo;

        public ListAllOrdersHandler(IOrdersRepo repo)
        {
            _repo = repo;
        }

        public async Task<IReadOnlyList<OrderDto>> Handle(ListAllOrdersQuery req, CancellationToken ct)
        {
            var orders = await _repo.ListAllAsync(ct);
            return orders.Select(o => new OrderDto(
                o.Id,
                o.Status,
                o.Currency,
                o.TotalAmount,
                o.CreatedAtUtc.ToString("O"),
                o.Items.Select(i => new OrderItemDto(i.ProductId, i.Name, i.UnitPrice, i.Quantity)).ToList(),
                o.Shipping is null ? null : new OrderShippingDto(o.Shipping.AddressLine, o.Shipping.City, o.Shipping.State),
                o.UserId
            )).ToList();
        }
    }
}
