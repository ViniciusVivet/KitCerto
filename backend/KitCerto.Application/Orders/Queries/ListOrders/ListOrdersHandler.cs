using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Orders.Queries.ListOrders
{
    public sealed class ListOrdersHandler : IRequestHandler<ListOrdersQuery, IReadOnlyList<OrderDto>>
    {
        private readonly IOrdersRepo _repo;

        public ListOrdersHandler(IOrdersRepo repo)
        {
            _repo = repo;
        }

        public async Task<IReadOnlyList<OrderDto>> Handle(ListOrdersQuery req, CancellationToken ct)
        {
            var orders = await _repo.ListByUserAsync(req.UserId, ct);
            return orders.Select(o => new OrderDto(
                o.Id,
                o.Status,
                o.Currency,
                o.TotalAmount,
                o.CreatedAtUtc.ToString("O"),
                o.Items.Select(i => new OrderItemDto(i.ProductId, i.Name, i.UnitPrice, i.Quantity)).ToList(),
                o.Shipping is null ? null : new OrderShippingDto(o.Shipping.AddressLine, o.Shipping.City, o.Shipping.State)
            )).ToList();
        }
    }
}
