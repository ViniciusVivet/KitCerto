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

        public ProcessMercadoPagoWebhookHandler(IPaymentGateway gateway, IOrdersRepo ordersRepo)
        {
            _gateway = gateway;
            _ordersRepo = ordersRepo;
        }

        public async Task<bool> Handle(ProcessMercadoPagoWebhookCmd req, CancellationToken ct)
        {
            if (req.Type != "payment" || string.IsNullOrWhiteSpace(req.DataId))
                return false;

            var info = await _gateway.GetPaymentInfoAsync(req.DataId, ct);
            if (info is null || string.IsNullOrWhiteSpace(info.ExternalReference))
                return false;

            // Mapeia status do MP para status do pedido (approved, rejected, pending, etc.)
            var status = MapStatus(info.Status);
            await _ordersRepo.UpdateStatusAsync(info.ExternalReference, status, ct);
            return true;
        }

        private static string MapStatus(string mpStatus)
        {
            return mpStatus?.ToLowerInvariant() switch
            {
                "approved" => "approved",
                "rejected" => "rejected",
                "cancelled" => "cancelled",
                "refunded" => "refunded",
                "charged_back" => "charged_back",
                "in_process" or "pending" or "in_mediation" => "pending",
                _ => mpStatus ?? "pending"
            };
        }
    }
}
