using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Settings;

namespace KitCerto.Domain.Repositories
{
    public interface ISettingsRepo
    {
        Task<StoreSettings> GetAsync(CancellationToken ct);
        Task UpdateAsync(StoreSettings settings, CancellationToken ct);
    }
}
