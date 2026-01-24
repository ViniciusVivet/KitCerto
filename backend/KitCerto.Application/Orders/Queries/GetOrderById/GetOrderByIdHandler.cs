using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Repositories;
using KitCerto.Application.Orders.Queries.ListOrders;

namespace KitCerto.Application.Orders.Queries.GetOrderById
{
    public sealed class GetOrderByIdHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?>
    {
        private readonly IOrdersRepo _repo;

        public GetOrderByIdHandler(IOrdersRepo repo)
        {
            _repo = repo;
        }

        public async Task<OrderDto?> Handle(GetOrderByIdQuery req, CancellationToken ct)
        {
            var order = await _repo.GetByIdAsync(req.OrderId, ct);
            if (order is null || order.UserId != req.UserId)
                return null;

            return new OrderDto(
                order.Id,
                order.Status,
                order.Currency,
                order.TotalAmount,
                order.CreatedAtUtc.ToString("O"),
                order.Items.Select(i => new OrderItemDto(i.ProductId, i.Name, i.UnitPrice, i.Quantity)).ToList(),
                order.Shipping is null ? null : new OrderShippingDto(order.Shipping.AddressLine, order.Shipping.City, order.Shipping.State)
            );
        }
    }
}
