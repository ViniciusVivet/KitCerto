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
        string ExternalReference
    );

    public sealed record CheckoutSession(
        string PreferenceId,
        string InitPoint,
        string? SandboxInitPoint
    );

    public interface IPaymentGateway
    {
        Task<CheckoutSession> CreateCheckoutAsync(CheckoutRequest request, CancellationToken ct);
    }
}
