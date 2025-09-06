import { apiGet } from "@/lib/api";
import { useMocks } from "@/lib/config";
import { mockSearchProducts, mockFetchCategories } from "@/lib/mock";
import { mockBestSellingProducts, mockLatestProducts } from "@/lib/mock";

export type ProductList = {
  items: any[];
  total: number;
  page?: number;
  pageSize?: number;
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

export async function listProductsWithMeta(params: { page?: number; pageSize?: number; name?: string; categoryId?: string }): Promise<DataMeta<ProductList>> {
  const forced = getForcedDataSource();
  const preferMock = useMocks || forced === "mock";
  if (preferMock) return { data: await mockSearchProducts(params.name, params.categoryId), source: "mock", fallback: false };

  try {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.pageSize) q.set("pageSize", String(params.pageSize));
    if (params.name) q.set("name", params.name);
    if (params.categoryId) q.set("categoryId", params.categoryId);
    const data = await apiGet<{ page: number; pageSize: number; total: number; items: any[] }>(`/api/products/search?${q.toString()}`);
    return { data: { items: data.items, total: data.total, page: data.page, pageSize: data.pageSize }, source: "api", fallback: false };
  } catch {
    return { data: await mockSearchProducts(params.name, params.categoryId), source: "mock", fallback: true };
  }
}

export async function listProducts(params: { page?: number; pageSize?: number; name?: string; categoryId?: string }): Promise<ProductList> {
  const { data } = await listProductsWithMeta(params);
  return data;
}

export async function listCategoriesWithMeta(params?: { page?: number; pageSize?: number }): Promise<DataMeta<any[]>> {
  const forced = getForcedDataSource();
  const preferMock = useMocks || forced === "mock";
  if (preferMock) return { data: await mockFetchCategories(), source: "mock", fallback: false };

  try {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const data = await apiGet<{ page: number; pageSize: number; total: number; items: any[] }>(`/api/categories?${q.toString()}`);
    return { data: data.items ?? (data as any), source: "api", fallback: false };
  } catch {
    return { data: await mockFetchCategories(), source: "mock", fallback: true };
  }
}

export async function listCategories(params?: { page?: number; pageSize?: number }) {
  const { data } = await listCategoriesWithMeta(params);
  return data;
}

// Novidades (API → fallback mocks)
export async function getLatestProductsWithMeta(limit: number = 10): Promise<DataMeta<any[]>> {
  const forced = getForcedDataSource();
  const preferMock = useMocks || forced === "mock";
  if (preferMock) return { data: await mockLatestProducts(limit), source: "mock", fallback: false };

  try {
    // Não há endpoint específico; usar a primeira página como proxy de "novidades"
    const { data } = await listProductsWithMeta({ page: 1, pageSize: limit });
    return { data: data.items ?? [], source: "api", fallback: false };
  } catch {
    return { data: await mockLatestProducts(limit), source: "mock", fallback: true };
  }
}

// Mais vendidos (API → fallback mocks)
export async function getBestSellingProductsWithMeta(limit: number = 10): Promise<DataMeta<any[]>> {
  const forced = getForcedDataSource();
  const preferMock = useMocks || forced === "mock";
  if (preferMock) return { data: await mockBestSellingProducts(limit), source: "mock", fallback: false };

  try {
    // Não há endpoint específico; usar a primeira página como proxy de "destaques"
    const { data } = await listProductsWithMeta({ page: 1, pageSize: limit });
    return { data: data.items ?? [], source: "api", fallback: false };
  } catch {
    return { data: await mockBestSellingProducts(limit), source: "mock", fallback: true };
  }
}


