using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Payments;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Orders.Webhook
{
    public sealed class ProcessMercadoPagoWebhookHandler : IRequestHandler<ProcessMercadoPagoWebhookCmd, bool>
    {
        private readonly IPaymentGateway _gateway;
        private readonly IOrdersRepo _ordersRepo;
        private readonly IProductsRepo _productsRepo;

        public ProcessMercadoPagoWebhookHandler(IPaymentGateway gateway, IOrdersRepo ordersRepo, IProductsRepo productsRepo)
        {
            _gateway = gateway;
            _ordersRepo = ordersRepo;
            _productsRepo = productsRepo;
        }

        // Status que indicam falha definitiva — estoque deve ser devolvido
        private static readonly System.Collections.Generic.HashSet<string> _failedStatuses =
            new() { "rejected", "cancelled", "charged_back" };

        public async Task<bool> Handle(ProcessMercadoPagoWebhookCmd req, CancellationToken ct)
        {
            if (req.Type != "payment" || string.IsNullOrWhiteSpace(req.DataId))
                return false;

            var info = await _gateway.GetPaymentInfoAsync(req.DataId, ct);
            if (info is null || string.IsNullOrWhiteSpace(info.ExternalReference))
                return false;

            var newStatus = MapStatus(info.Status);
            var orderId = info.ExternalReference;

            // Obtém o pedido antes de atualizar para comparar status anterior
            var order = await _ordersRepo.GetByIdAsync(orderId, ct);

            await _ordersRepo.UpdateStatusAsync(orderId, newStatus, ct);

            // Restaura estoque se o pagamento falhou e o pedido ainda não estava em estado de falha
            // (evita restaurar duas vezes caso o webhook chegue duplicado)
            if (order is not null && _failedStatuses.Contains(newStatus) && !_failedStatuses.Contains(order.Status))
            {
                foreach (var item in order.Items)
                {
                    if (string.IsNullOrWhiteSpace(item.ProductId)) continue;
                    var product = await _productsRepo.GetByIdAsync(item.ProductId, ct);
                    if (product is null) continue;
                    await _productsRepo.UpdateStockAsync(item.ProductId, product.Stock + item.Quantity, ct);
                }
            }

            return true;
        }

        private static string MapStatus(string mpStatus)
        {
            return mpStatus?.ToLowerInvariant() switch
            {
                "approved"   => "approved",
                "rejected"   => "rejected",
                "cancelled"  => "cancelled",
                "refunded"   => "refunded",
                "charged_back" => "charged_back",
                "in_process" or "pending" or "in_mediation" => "pending",
                _ => mpStatus ?? "pending"
            };
        }
    }
}
