using System.Threading;
using System.Threading.Tasks;

namespace KitCerto.Domain.Support
{
    /// <summary>Notifica a loja (ex.: e-mail) quando o cliente envia mensagem em um ticket atribuído a ela.</summary>
    public interface INotifySellerService
    {
        Task NotifyNewMessageAsync(string ticketId, string sellerEmail, string customerMessage, CancellationToken ct);
    }
}
