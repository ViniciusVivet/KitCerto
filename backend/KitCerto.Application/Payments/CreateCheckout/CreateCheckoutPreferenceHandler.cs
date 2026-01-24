using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Payments;

namespace KitCerto.Application.Payments.CreateCheckout
{
    public sealed class CreateCheckoutPreferenceHandler
        : IRequestHandler<CreateCheckoutPreferenceCmd, CreateCheckoutPreferenceResult>
    {
        private readonly IPaymentGateway _gateway;

        public CreateCheckoutPreferenceHandler(IPaymentGateway gateway)
        {
            _gateway = gateway;
        }

        public async Task<CreateCheckoutPreferenceResult> Handle(CreateCheckoutPreferenceCmd req, CancellationToken ct)
        {
            var session = await _gateway.CreateCheckoutAsync(new CheckoutRequest(
                Description: req.Description,
                Amount: req.Amount,
                Currency: req.Currency,
                SuccessUrl: req.SuccessUrl,
                FailureUrl: req.FailureUrl,
                PendingUrl: req.PendingUrl,
                ExternalReference: req.ExternalReference
            ), ct);

            return new CreateCheckoutPreferenceResult(
                session.PreferenceId,
                session.InitPoint,
                session.SandboxInitPoint
            );
        }
    }
}
