using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using KitCerto.Domain.Support;

namespace KitCerto.Infrastructure.Support
{
    /// <summary>Stub: apenas loga. Em produção, implementar envio de e-mail (SMTP, SendGrid, etc.).</summary>
    public sealed class LogNotifySellerService : INotifySellerService
    {
        private readonly ILogger<LogNotifySellerService> _log;

        public LogNotifySellerService(ILogger<LogNotifySellerService> log)
        {
            _log = log;
        }

        public Task NotifyNewMessageAsync(string ticketId, string sellerEmail, string customerMessage, CancellationToken ct)
        {
            _log.LogInformation(
                "[NotifySeller] Ticket {TicketId} – Nova mensagem do cliente para loja {SellerEmail}: {Preview}",
                ticketId, sellerEmail,
                customerMessage.Length > 100 ? customerMessage.Substring(0, 100) + "…" : customerMessage);
            return Task.CompletedTask;
        }
    }
}
