using System.Collections.Generic;
using MediatR;

namespace KitCerto.Application.PaymentMethods.Queries.ListPaymentMethods
{
    public sealed record ListPaymentMethodsQuery(string UserId) : IRequest<IReadOnlyList<PaymentMethodDto>>;

    public sealed record PaymentMethodDto(string Id, string Last4, string Brand, bool IsDefault);
}
