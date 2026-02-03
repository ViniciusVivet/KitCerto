using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.PaymentMethods.Queries.ListPaymentMethods
{
    public sealed class ListPaymentMethodsHandler : IRequestHandler<ListPaymentMethodsQuery, IReadOnlyList<PaymentMethodDto>>
    {
        private readonly IPaymentMethodsRepo _repo;

        public ListPaymentMethodsHandler(IPaymentMethodsRepo repo) => _repo = repo;

        public async Task<IReadOnlyList<PaymentMethodDto>> Handle(ListPaymentMethodsQuery req, CancellationToken ct)
        {
            var list = await _repo.ListByUserIdAsync(req.UserId, ct);
            return list.Select(m => new PaymentMethodDto(m.Id, m.Last4, m.Brand, m.IsDefault)).ToList();
        }
    }
}
