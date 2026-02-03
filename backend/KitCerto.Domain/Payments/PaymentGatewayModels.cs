using System.Threading;
using System.Threading.Tasks;

namespace KitCerto.Domain.Payments
{
    public sealed record CheckoutRequest(
        string Description,
        decimal Amount,
        string Currency,
        string SuccessUrl,
        string FailureUrl,
        string PendingUrl,
        string ExternalReference,
        string? PayerEmail = null
    );

    public sealed record CheckoutSession(
        string PreferenceId,
        string InitPoint,
        string? SandboxInitPoint
    );

    /// <summary>Resultado ao adicionar cartão ao customer no MP (tokenização; nunca armazenamos número do cartão).</summary>
    public sealed record AddCardResult(string MpCardId, string Last4, string Brand);

    /// <summary>Dados do pagamento retornados pelo MP (para webhook).</summary>
    public sealed record PaymentInfo(string ExternalReference, string Status);

    public interface IPaymentGateway
    {
        Task<CheckoutSession> CreateCheckoutAsync(CheckoutRequest request, CancellationToken ct);
        /// <summary>Obtém ou cria customer no MP por e-mail; retorna o customer_id.</summary>
        Task<string> CreateOrGetCustomerAsync(string email, string? firstName, string? lastName, CancellationToken ct);
        /// <summary>Adiciona cartão ao customer usando token (gerado no front pelo SDK do MP).</summary>
        Task<AddCardResult> AddCardToCustomerAsync(string customerId, string token, CancellationToken ct);
        /// <summary>Busca dados do pagamento no MP (para webhook).</summary>
        Task<PaymentInfo?> GetPaymentInfoAsync(string paymentId, CancellationToken ct);
    }
}
