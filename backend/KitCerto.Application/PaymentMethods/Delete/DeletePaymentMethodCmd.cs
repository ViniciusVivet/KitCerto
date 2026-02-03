using MediatR;

namespace KitCerto.Application.PaymentMethods.Delete
{
    public sealed record DeletePaymentMethodCmd(string UserId, string Id) : IRequest<bool>;
}
