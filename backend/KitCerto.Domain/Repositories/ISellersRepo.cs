using System.Threading;
using System.Threading.Tasks;
using KitCerto.Domain.Sellers;

namespace KitCerto.Domain.Repositories
{
    /// <summary>Repositório de lojas/vendedores aprovados (Seller), não de solicitações (SellerRequest).</summary>
    public interface ISellersRepo
    {
        Task<Seller?> GetByUserIdAsync(string userId, CancellationToken ct);
        Task<Seller?> GetByIdAsync(string sellerId, CancellationToken ct);
        Task<Seller> CreateAsync(Seller seller, CancellationToken ct);
    }
}
