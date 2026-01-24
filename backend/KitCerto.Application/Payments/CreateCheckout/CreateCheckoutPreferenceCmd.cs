using MediatR;

namespace KitCerto.Application.Payments.CreateCheckout
{
    public sealed record CreateCheckoutPreferenceCmd(
        string Description,
        decimal Amount,
        string Currency,
        string SuccessUrl,
        string FailureUrl,
        string PendingUrl,
        string ExternalReference
    ) : IRequest<CreateCheckoutPreferenceResult>;

    public sealed record CreateCheckoutPreferenceResult(
        string PreferenceId,
        string InitPoint,
        string? SandboxInitPoint
    );
}
