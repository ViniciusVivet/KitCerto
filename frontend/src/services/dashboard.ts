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

type ApiDashboardOverview = {
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
  byCategory: { categoryId: string; categoryName?: string; count: number }[];
  byCategoryValue: { categoryId: string; categoryName?: string; totalValue: number }[];
  topProductsByValue: { productId: string; productName: string; stockValue: number; stock: number }[];
  priceBuckets: { range: string; count: number }[];
  lowStockItems: { productId: string; productName: string; stock: number; threshold?: number }[];
};

function mapApiDashboardOverview(api: ApiDashboardOverview): DashboardOverview {
  return {
    totalProducts: api.totalProducts ?? 0,
    lowStock: api.lowStockCount ?? 0,
    totalValue: api.totalStockValue ?? 0,
    byCategory: (api.byCategory ?? []).map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      count: item.count,
    })),
    byCategoryValue: (api.byCategoryValue ?? []).map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      value: item.totalValue,
    })),
    topProductsByValue: (api.topProductsByValue ?? []).map((item) => ({
      id: item.productId,
      name: item.productName,
      value: item.stockValue,
    })),
    priceBuckets: (api.priceBuckets ?? []).map((item) => ({
      label: item.range,
      count: item.count,
    })),
    lowStockItems: (api.lowStockItems ?? []).map((item) => ({
      id: item.productId,
      name: item.productName,
      stock: item.stock,
    })),
  };
}

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
    const data = await apiGet<ApiDashboardOverview>(`/dashboard/overview`);
    return { data: mapApiDashboardOverview(data), source: "api", fallback: false };
  } catch (error) {
    console.warn("Erro ao buscar dashboard da API, usando fallback para mocks:", error);
    return { data: await mockDashboard(), source: "mock", fallback: true };
  }
}

// compat: mantém assinatura antiga
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await getDashboardOverviewWithMeta();
  return data;
}


