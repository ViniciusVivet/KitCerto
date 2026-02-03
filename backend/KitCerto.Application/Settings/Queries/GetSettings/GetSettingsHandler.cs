using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Settings;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Settings.Queries.GetSettings
{
    public sealed class GetSettingsHandler : IRequestHandler<GetSettingsQuery, StoreSettings>
    {
        private readonly ISettingsRepo _repo;
        public GetSettingsHandler(ISettingsRepo repo) => _repo = repo;

        public Task<StoreSettings> Handle(GetSettingsQuery req, CancellationToken ct) => _repo.GetAsync(ct);
    }
}
