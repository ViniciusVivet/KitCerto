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
    }

    public sealed class DashboardByCategoryItem
    {
        public string CategoryId { get; set; } = "";
        public string? CategoryName { get; set; } // podemos preencher depois
        public int Count { get; set; }
    }
}
