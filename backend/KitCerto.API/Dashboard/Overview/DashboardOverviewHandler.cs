using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Repositories;

namespace KitCerto.Application.Dashboard.Overview
{
    public sealed class DashboardOverviewHandler : IRequestHandler<DashboardOverviewQuery, DashboardOverviewDto>
    {
        private readonly IProductsRepo _products;
        private readonly ICategoriesRepo _categories;

        public DashboardOverviewHandler(IProductsRepo products, ICategoriesRepo categories)
        {
            _products = products;
            _categories = categories;
        }

        public async Task<DashboardOverviewDto> Handle(DashboardOverviewQuery req, CancellationToken ct)
        {
            // total = count sem filtro
            var total = await _products.CountAsync(name: null, categoryId: null, ct);
            var low = await _products.LowStockCountAsync(threshold: 10, ct);
            var totalValue = await _products.TotalStockValueAsync(ct);
            var byCat = await _products.CountByCategoryAsync(ct);

            // enriquecer com nome da categoria (opcional)
            var enriched = await Task.WhenAll(byCat.Select(async c =>
            {
                var cat = await _categories.GetByIdAsync(c.CategoryId, ct);
                return new DashboardByCategoryItem
                {
                    CategoryId = c.CategoryId,
                    CategoryName = cat?.Name,
                    Count = c.Count
                };
            }));

            return new DashboardOverviewDto
            {
                TotalProducts = (int)total,
                LowStockCount = low,
                TotalStockValue = totalValue,
                ByCategory = enriched.ToList()
            };
        }
    }
}
