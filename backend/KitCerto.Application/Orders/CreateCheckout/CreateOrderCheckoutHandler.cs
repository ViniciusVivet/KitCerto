using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Orders;
using KitCerto.Domain.Payments;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Orders.CreateCheckout
{
    public sealed class CreateOrderCheckoutHandler
        : IRequestHandler<CreateOrderCheckoutCmd, CreateOrderCheckoutResult>
    {
        private readonly IProductsRepo _products;
        private readonly IOrdersRepo _orders;
        private readonly IPaymentGateway _payments;

        public CreateOrderCheckoutHandler(IProductsRepo products, IOrdersRepo orders, IPaymentGateway payments)
        {
            _products = products;
            _orders = orders;
            _payments = payments;
        }

        public async Task<CreateOrderCheckoutResult> Handle(CreateOrderCheckoutCmd req, CancellationToken ct)
        {
            if (req.Items is null || req.Items.Count == 0)
            {
                return new CreateOrderCheckoutResult(false, "empty_items", "Carrinho vazio.", null, null, 0m, "BRL");
            }

            var items = new List<OrderItem>();
            decimal total = 0m;

            foreach (var it in req.Items)
            {
                if (string.IsNullOrWhiteSpace(it.ProductId) || it.Quantity <= 0)
                    return new CreateOrderCheckoutResult(false, "invalid_item", "Item inválido.", null, null, 0m, "BRL");

                var product = await _products.GetByIdAsync(it.ProductId, ct);
                if (product is null)
                    return new CreateOrderCheckoutResult(false, "product_not_found", $"Produto não encontrado: {it.ProductId}", null, null, 0m, "BRL");

                if (product.Stock < it.Quantity)
                    return new CreateOrderCheckoutResult(false, "insufficient_stock", $"Estoque insuficiente: {product.Name}", null, null, 0m, "BRL");

                var productId = string.IsNullOrWhiteSpace(product.Id) ? it.ProductId : product.Id;
                items.Add(new OrderItem(productId, product.Name, product.Price, it.Quantity));
                total += product.Price * it.Quantity;
            }

            var orderId = $"O-{Guid.NewGuid():N}";
            var shipping = req.Shipping is null
                ? null
                : new OrderShipping(req.Shipping.AddressLine, req.Shipping.City, req.Shipping.State);

            var currency = string.IsNullOrWhiteSpace(req.Currency) ? "BRL" : req.Currency;
            var order = new Order(orderId, req.UserId, currency, total, items, shipping);
            await _orders.CreateAsync(order, ct);

            // Reserva estoque (reduz imediatamente)
            foreach (var it in req.Items)
            {
                var product = await _products.GetByIdAsync(it.ProductId, ct);
                if (product is not null)
                {
                    var newStock = Math.Max(0, product.Stock - it.Quantity);
                    await _products.UpdateStockAsync(it.ProductId, newStock, ct);
                }
            }

            var session = await _payments.CreateCheckoutAsync(new CheckoutRequest(
                Description: $"Pedido {orderId}",
                Amount: total,
                Currency: currency,
                SuccessUrl: req.SuccessUrl,
                FailureUrl: req.FailureUrl,
                PendingUrl: req.PendingUrl,
                ExternalReference: orderId
            ), ct);

            await _orders.UpdatePaymentAsync(orderId, "mercadopago", session.PreferenceId, ct);

            var checkoutUrl = session.SandboxInitPoint ?? session.InitPoint;

            return new CreateOrderCheckoutResult(true, null, null, orderId, checkoutUrl, total, currency);
        }
    }
}
