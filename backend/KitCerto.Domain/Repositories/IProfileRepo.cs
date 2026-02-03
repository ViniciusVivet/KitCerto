using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Profile;

namespace KitCerto.Domain.Repositories
{
    public interface IProfileRepo
    {
        Task<UserProfile?> GetByUserIdAsync(string userId, CancellationToken ct);
        Task UpsertAsync(UserProfile profile, CancellationToken ct);
    }
}
