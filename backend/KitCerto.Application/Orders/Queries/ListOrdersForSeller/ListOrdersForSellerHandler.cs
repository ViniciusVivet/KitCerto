using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Repositories;
using KitCerto.Application.Orders.Queries.ListOrders;
using MediatR;

namespace KitCerto.Application.Orders.Queries.ListOrdersForSeller;

public sealed class ListOrdersForSellerHandler : IRequestHandler<ListOrdersForSellerQuery, IReadOnlyList<OrderDto>>
{
    private readonly ISellersRepo _sellers;
    private readonly IProductsRepo _products;
    private readonly IOrdersRepo _orders;

    public ListOrdersForSellerHandler(ISellersRepo sellers, IProductsRepo products, IOrdersRepo orders)
    {
        _sellers = sellers;
        _products = products;
        _orders = orders;
    }

    public async Task<IReadOnlyList<OrderDto>> Handle(ListOrdersForSellerQuery req, CancellationToken ct)
    {
        var seller = await _sellers.GetByUserIdAsync(req.UserId, ct);
        if (seller is null) return System.Array.Empty<OrderDto>();

        var products = await _products.ListBySellerIdAsync(seller.Id, 1, 10_000, ct);
        var productIds = products.Select(p => p.Id).ToList();
        if (productIds.Count == 0) return System.Array.Empty<OrderDto>();

        var orders = await _orders.ListWhereItemsContainProductIdsAsync(productIds, ct);
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
