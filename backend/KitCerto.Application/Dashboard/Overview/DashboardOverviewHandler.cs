using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using KitCerto.Domain.Repositories;
using Microsoft.Extensions.Caching.Memory;

namespace KitCerto.Application.Dashboard.Overview
{
    public sealed class DashboardOverviewHandler : IRequestHandler<DashboardOverviewQuery, DashboardOverviewDto>
    {
        private readonly IProductsRepo _products;
        private readonly ICategoriesRepo _categories;
        private readonly IMemoryCache _cache;

        public DashboardOverviewHandler(IProductsRepo products, ICategoriesRepo categories, IMemoryCache cache)
        {
            _products = products;
            _categories = categories;
            _cache = cache;
        }

        public async Task<DashboardOverviewDto> Handle(DashboardOverviewQuery req, CancellationToken ct)
        {
            if (_cache.TryGetValue("dashboard:overview", out DashboardOverviewDto? cached) && cached is not null)
                return cached;

            // Dados básicos
            var total = await _products.CountAsync(name: null, categoryId: null, ct);
            var low = await _products.LowStockCountAsync(threshold: 10, ct);
            var totalValue = await _products.TotalStockValueAsync(ct);
            
            // Dados por categoria (contagem)
            var byCat = await _products.CountByCategoryAsync(ct);
            
            // Dados adicionais para gráficos
            var byCatValue = await _products.ValueByCategoryAsync(ct);
            var topProducts = await _products.TopProductsByValueAsync(limit: 5, ct);
            var priceBuckets = await _products.PriceBucketsAsync(ct);
            var lowStockItems = await _products.LowStockItemsAsync(threshold: 10, ct);

            // Enriquecer com nome da categoria (batch): busca apenas ids necessários
            var categoryIds = byCat.Select(x => x.CategoryId)
                .Concat(byCatValue.Select(x => x.CategoryId))
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct()
                .ToArray();
            var categories = categoryIds.Length == 0
                ? Array.Empty<KitCerto.Domain.Categories.Category>()
                : await _categories.GetByIdsAsync(categoryIds, ct);
            var idToName = categories.ToDictionary(c => c.Id, c => c.Name);

            // Enriquecer dados por categoria (contagem)
            var enrichedByCat = byCat
                .Select(c => new DashboardByCategoryItem
                {
                    CategoryId = c.CategoryId,
                    CategoryName = idToName.TryGetValue(c.CategoryId, out var name) ? name : null,
                    Count = c.Count
                })
                .ToArray();

            // Enriquecer dados por categoria (valor)
            var enrichedByCatValue = byCatValue
                .Select(c => new DashboardByCategoryValueItem
                {
                    CategoryId = c.CategoryId,
                    CategoryName = idToName.TryGetValue(c.CategoryId, out var name) ? name : null,
                    TotalValue = c.TotalValue
                })
                .ToArray();

            // Enriquecer top produtos
            var enrichedTopProducts = topProducts
                .Select(p => new DashboardTopProductItem
                {
                    ProductId = p.Id,
                    ProductName = p.Name,
                    StockValue = p.Price * p.Stock,
                    Stock = p.Stock
                })
                .ToArray();

            // Enriquecer buckets de preço
            var enrichedPriceBuckets = priceBuckets
                .Select(b => new DashboardPriceBucketItem
                {
                    Range = b.Range,
                    Count = b.Count
                })
                .ToArray();

            // Enriquecer itens com baixo estoque
            var enrichedLowStockItems = lowStockItems
                .Select(p => new DashboardLowStockItem
                {
                    ProductId = p.Id,
                    ProductName = p.Name,
                    Stock = p.Stock,
                    Threshold = 10
                })
                .ToArray();

            var dto = new DashboardOverviewDto
            {
                TotalProducts = (int)total,
                LowStockCount = low,
                TotalStockValue = totalValue,
                ByCategory = enrichedByCat.ToList(),
                ByCategoryValue = enrichedByCatValue.ToList(),
                TopProductsByValue = enrichedTopProducts.ToList(),
                PriceBuckets = enrichedPriceBuckets.ToList(),
                LowStockItems = enrichedLowStockItems.ToList()
            };

            _cache.Set("dashboard:overview", dto, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30)
            });

            return dto;
        }
    }
}
