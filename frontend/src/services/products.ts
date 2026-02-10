import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useMocks, apiBaseUrl } from "@/lib/config";
import { getToken } from "@/lib/keycloak";
import { mockSearchProducts, mockFetchCategories, mockCreateProduct, mockUpdateProduct, mockDeleteProduct } from "@/lib/mock";
import { mockBestSellingProducts, mockLatestProducts } from "@/lib/mock";

import { listCategories, listCategoriesWithMeta } from "./categories";

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
  try {
    const url = new URL(window.location.href);
    const raw = (url.searchParams.get("data") || url.searchParams.get("ds") || "").toLowerCase();
    if (raw === "api" || raw === "mock") return raw as DataSource;
  } catch {
    return null;
  }
  return null;
}

export async function listProductsWithMeta(params: { page?: number; pageSize?: number; name?: string; categoryId?: string }, skipMock: boolean = false): Promise<DataMeta<ProductList>> {
  const forced = getForcedDataSource();
  const preferMock = !skipMock && (useMocks || forced === "mock");
  if (preferMock) return { data: await mockSearchProducts(params.name, params.categoryId), source: "mock", fallback: false };

  try {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.pageSize) q.set("pageSize", String(params.pageSize));
    if (params.name) q.set("name", params.name);
    if (params.categoryId) q.set("categoryId", params.categoryId);
    const data = await apiGet<any>(`/products?${q.toString()}`);
    
    const items = Array.isArray(data) ? data : (data?.items && Array.isArray(data.items)) ? data.items : [];
    const total = data?.total ?? items.length;
    
    return { 
      data: { 
        items, 
        total, 
        page: data?.page ?? params.page ?? 1, 
        pageSize: data?.pageSize ?? params.pageSize ?? items.length 
      }, 
      source: "api", 
      fallback: false 
    };
  } catch (error) {
    console.warn("Erro ao buscar produtos da API, usando fallback para mocks:", error);
    if (skipMock) throw error;
    return { data: await mockSearchProducts(params.name, params.categoryId), source: "mock", fallback: true };
  }
}

export async function listProducts(params: { page?: number; pageSize?: number; name?: string; categoryId?: string }, skipMock: boolean = false): Promise<ProductList> {
  const result = await listProductsWithMeta(params, skipMock);
  if (!result || !result.data) return { items: [], total: 0 };
  return result.data;
}

export { listCategories, listCategoriesWithMeta };


// Novidades (API → fallback mocks)
export async function getLatestProductsWithMeta(limit: number = 10): Promise<DataMeta<any[]>> {
  const forced = getForcedDataSource();
  const preferMock = useMocks || forced === "mock";
  if (preferMock) return { data: await mockLatestProducts(limit), source: "mock", fallback: false };

  // Não há endpoint específico; usar a primeira página como proxy de "novidades"
  const { data } = await listProductsWithMeta({ page: 1, pageSize: limit });
  return { data: data.items ?? [], source: "api", fallback: false };
}

// Mais vendidos (API → fallback mocks)
export async function getBestSellingProductsWithMeta(limit: number = 10): Promise<DataMeta<any[]>> {
  const forced = getForcedDataSource();
  const preferMock = useMocks || forced === "mock";
  if (preferMock) return { data: await mockBestSellingProducts(limit), source: "mock", fallback: false };

  // Não há endpoint específico; usar a primeira página como proxy de "destaques"
  const { data } = await listProductsWithMeta({ page: 1, pageSize: limit });
  return { data: data.items ?? [], source: "api", fallback: false };
}

// CRUD
export async function createProduct(payload: any) {
  const forced = getForcedDataSource();
  // No dashboard, nunca usamos mock para escrita a menos que explicitamente forçado via URL
  if (forced === "mock") {
    return Promise.resolve(mockCreateProduct(payload));
  }
  return apiPost<any>(`/products`, payload);
}

/** Lista produtos da loja do vendedor (GET /sellers/me/products). */
export async function listSellerProducts(params: { page?: number; pageSize?: number } = {}): Promise<ProductList> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  const data = await apiGet<any>(`/sellers/me/products?${q.toString()}`);
  const items = Array.isArray(data?.items) ? data.items : [];
  return { items, total: data?.total ?? items.length, page: data?.page ?? 1, pageSize: data?.pageSize ?? 20 };
}

/** Cria produto vinculado à loja do vendedor (POST /sellers/me/products). */
export async function createSellerProduct(payload: any): Promise<{ id: string }> {
  return apiPost<{ id: string }>(`/sellers/me/products`, payload);
}

export async function updateProduct(id: string, payload: any) {
  const forced = getForcedDataSource();
  if (forced === "mock") {
    return Promise.resolve(mockUpdateProduct(id, payload));
  }
  return apiPut<any>(`/products/${id}`, payload);
}

export async function deleteProduct(id: string) {
  const forced = getForcedDataSource();
  if (forced === "mock") {
    return Promise.resolve(mockDeleteProduct(id));
  }
  return apiDelete(`/products/${id}`);
}

export async function getProductById(id: string) {
  return apiGet<any>(`/products/${id}`);
}

export async function updateProductStock(id: string, stock: number) {
  const forced = getForcedDataSource();
  if (forced === "mock") {
    return Promise.resolve(mockUpdateProduct(id, { stock }));
  }
  // Usamos PATCH para atualização parcial de estoque
  if (!apiBaseUrl) throw new Error("API base URL não configurada (NEXT_PUBLIC_API_BASE_URL)");
  return fetch(`${apiBaseUrl}/products/${id}/stock`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: getToken() ? `Bearer ${getToken()}` : "" 
    },
    body: JSON.stringify({ stock }),
  });
}


