import { apiGet } from "@/lib/api";
import { useMocks } from "@/lib/config";
import { mockDashboard } from "@/lib/mock";

export type DashboardByCategory = { categoryId: string; categoryName?: string; count: number };
export type DashboardByCategoryValue = { categoryId: string; categoryName?: string; value: number };
export type DashboardTopProduct = { id: string; name: string; value: number };
export type DashboardPriceBucket = { label: string; count: number };
export type DashboardLowStockItem = { id: string; name: string; stock: number };

export type DashboardOverview = {
  totalProducts: number;
  lowStock: number;
  totalValue: number;
  byCategory: DashboardByCategory[];
  byCategoryValue: DashboardByCategoryValue[];
  topProductsByValue: DashboardTopProduct[];
  priceBuckets: DashboardPriceBucket[];
  lowStockItems: DashboardLowStockItem[];
};

export type DataSource = "api" | "mock";
export type DataMeta<T> = { data: T; source: DataSource; fallback: boolean };

function getForcedDataSource(): DataSource | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const raw = (url.searchParams.get("data") || url.searchParams.get("ds") || "").toLowerCase();
  if (raw === "api" || raw === "mock") return raw;
  return null;
}

export async function getDashboardOverviewWithMeta(): Promise<DataMeta<DashboardOverview>> {
  const forced = getForcedDataSource();
  const preferMock = useMocks || forced === "mock";
  if (preferMock) return { data: await mockDashboard(), source: "mock", fallback: false };

  try {
    const data = await apiGet<DashboardOverview>(`/api/dashboard/overview`);
    return { data, source: "api", fallback: false };
  } catch {
    // fallback preservado
    return { data: await mockDashboard(), source: "mock", fallback: true };
  }
}

// compat: mantém assinatura antiga
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await getDashboardOverviewWithMeta();
  return data;
}


