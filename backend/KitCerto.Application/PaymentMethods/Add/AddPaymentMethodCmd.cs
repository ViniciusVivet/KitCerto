using MediatR;

namespace KitCerto.Application.PaymentMethods.Add
{
    public sealed record AddPaymentMethodCmd(string UserId, string UserEmail, string? UserFirstName, string? UserLastName, string Token)
        : IRequest<AddPaymentMethodResult>;

    public sealed record AddPaymentMethodResult(string Id, string Last4, string Brand);
}
