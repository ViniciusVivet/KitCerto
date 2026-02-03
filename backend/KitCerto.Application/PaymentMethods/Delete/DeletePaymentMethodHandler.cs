using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.PaymentMethods.Delete
{
    public sealed class DeletePaymentMethodHandler : IRequestHandler<DeletePaymentMethodCmd, bool>
    {
        private readonly IPaymentMethodsRepo _repo;

        public DeletePaymentMethodHandler(IPaymentMethodsRepo repo) => _repo = repo;

        public async Task<bool> Handle(DeletePaymentMethodCmd req, CancellationToken ct)
        {
            var existing = await _repo.GetByIdAndUserIdAsync(req.Id, req.UserId, ct);
            if (existing is null) return false;
            await _repo.DeleteAsync(req.Id, req.UserId, ct);
            return true;
        }
    }
}
