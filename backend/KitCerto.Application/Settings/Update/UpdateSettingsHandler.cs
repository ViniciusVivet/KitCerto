using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Settings;
using KitCerto.Domain.Repositories;
using MediatR;

namespace KitCerto.Application.Settings.Update
{
    public sealed class UpdateSettingsHandler : IRequestHandler<UpdateSettingsCmd>
    {
        private readonly ISettingsRepo _repo;
        public UpdateSettingsHandler(ISettingsRepo repo) => _repo = repo;

        public async Task Handle(UpdateSettingsCmd req, CancellationToken ct)
        {
            var settings = await _repo.GetAsync(ct);
            settings.StoreName = req.StoreName;
            settings.SupportEmail = req.SupportEmail;
            settings.SupportPhone = req.SupportPhone;
            settings.FreeShippingThreshold = req.FreeShippingThreshold;
            settings.PromoBannerActive = req.PromoBannerActive;
            settings.PromoBannerText = req.PromoBannerText;
            settings.MaintenanceMode = req.MaintenanceMode;

            await _repo.UpdateAsync(settings, ct);
        }
    }
}
