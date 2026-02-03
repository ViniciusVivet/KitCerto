using MediatR;

namespace KitCerto.Application.Orders.Webhook
{
    /// <summary>Payload enviado pelo Mercado Pago no webhook.</summary>
    public sealed record ProcessMercadoPagoWebhookCmd(string Type, string? DataId) : IRequest<bool>;

    /// <summary>Resultado do processamento (true se atualizou pedido).</summary>
    public sealed record ProcessMercadoPagoWebhookResult(bool Processed);
}
