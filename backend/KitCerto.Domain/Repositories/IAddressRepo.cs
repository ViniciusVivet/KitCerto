using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Addresses;

namespace KitCerto.Domain.Repositories
{
    public interface IAddressRepo
    {
        Task<Address?> GetByIdAsync(string userId, string addressId, CancellationToken ct);
        Task<System.Collections.Generic.IReadOnlyList<Address>> ListByUserAsync(string userId, CancellationToken ct);
        Task<Address> CreateAsync(Address address, CancellationToken ct);
        Task UpdateAsync(Address address, CancellationToken ct);
        Task DeleteAsync(string userId, string addressId, CancellationToken ct);
        Task UnsetDefaultForUserAsync(string userId, CancellationToken ct);
    }
}
