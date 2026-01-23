using System.Collections.Generic;
using MediatR;

namespace KitCerto.Application.Dashboard.Overview
{
    public sealed record DashboardOverviewQuery() : IRequest<DashboardOverviewDto>;

    public sealed class DashboardOverviewDto
    {
        public int TotalProducts { get; set; }
        public decimal TotalStockValue { get; set; }
        public int LowStockCount { get; set; }
        public IReadOnlyList<DashboardByCategoryItem> ByCategory { get; set; } = [];
        
        // Propriedades adicionais para os gráficos do frontend
        public IReadOnlyList<DashboardByCategoryValueItem> ByCategoryValue { get; set; } = [];
        public IReadOnlyList<DashboardTopProductItem> TopProductsByValue { get; set; } = [];
        public IReadOnlyList<DashboardPriceBucketItem> PriceBuckets { get; set; } = [];
        public IReadOnlyList<DashboardLowStockItem> LowStockItems { get; set; } = [];
    }

    public sealed class DashboardByCategoryItem
    {
        public string CategoryId { get; set; } = "";
        public string? CategoryName { get; set; } // podemos preencher depois
        public int Count { get; set; }
    }

    public sealed class DashboardByCategoryValueItem
    {
        public string CategoryId { get; set; } = "";
        public string? CategoryName { get; set; }
        public decimal TotalValue { get; set; }
    }

    public sealed class DashboardTopProductItem
    {
        public string ProductId { get; set; } = "";
        public string ProductName { get; set; } = "";
        public decimal StockValue { get; set; }
        public int Stock { get; set; }
    }

    public sealed class DashboardPriceBucketItem
    {
        public string Range { get; set; } = "";
        public int Count { get; set; }
    }

    public sealed class DashboardLowStockItem
    {
        public string ProductId { get; set; } = "";
        public string ProductName { get; set; } = "";
        public int Stock { get; set; }
        public int Threshold { get; set; }
    }
}
