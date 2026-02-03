using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Payments;
using KitCerto.Domain.Profile;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.PaymentMethods.Add
{
    public sealed class AddPaymentMethodHandler : IRequestHandler<AddPaymentMethodCmd, AddPaymentMethodResult>
    {
        private readonly IProfileRepo _profileRepo;
        private readonly IPaymentMethodsRepo _paymentMethodsRepo;
        private readonly IPaymentGateway _gateway;

        public AddPaymentMethodHandler(IProfileRepo profileRepo, IPaymentMethodsRepo paymentMethodsRepo, IPaymentGateway gateway)
        {
            _profileRepo = profileRepo;
            _paymentMethodsRepo = paymentMethodsRepo;
            _gateway = gateway;
        }

        public async Task<AddPaymentMethodResult> Handle(AddPaymentMethodCmd req, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(req.UserEmail))
                throw new InvalidOperationException("E-mail do usuário é necessário para salvar cartão no Mercado Pago.");

            var profile = await _profileRepo.GetByUserIdAsync(req.UserId, ct);
            string customerId;
            if (!string.IsNullOrWhiteSpace(profile?.MpCustomerId))
            {
                customerId = profile.MpCustomerId;
            }
            else
            {
                customerId = await _gateway.CreateOrGetCustomerAsync(
                    req.UserEmail,
                    req.UserFirstName ?? profile?.DisplayName ?? profile?.FullName,
                    req.UserLastName,
                    ct);
                if (profile is null)
                {
                    profile = new UserProfile(req.UserId, null, null, null, null, null, null, false);
                    profile.SetMpCustomerId(customerId);
                    await _profileRepo.UpsertAsync(profile, ct);
                }
                else
                {
                    profile.SetMpCustomerId(customerId);
                    await _profileRepo.UpsertAsync(profile, ct);
                }
            }

            var addResult = await _gateway.AddCardToCustomerAsync(customerId, req.Token, ct);

            var existing = await _paymentMethodsRepo.ListByUserIdAsync(req.UserId, ct);
            var isDefault = existing.Count == 0;
            var id = $"pm-{Guid.NewGuid():N}";
            var method = new SavedPaymentMethod(id, req.UserId, addResult.MpCardId, addResult.Last4, addResult.Brand, isDefault);
            await _paymentMethodsRepo.AddAsync(method, ct);

            return new AddPaymentMethodResult(id, addResult.Last4, addResult.Brand);
        }
    }
}
