import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useMocks } from "@/lib/config";
import { mockFetchCategories } from "@/lib/mock";

export type Category = {
  id: string;
  name: string;
  description: string;
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

export async function listCategoriesWithMeta(params?: { page?: number; pageSize?: number }, skipMock: boolean = false): Promise<DataMeta<Category[]>> {
  const forced = getForcedDataSource();
  const preferMock = !skipMock && (useMocks || forced === "mock");
  if (preferMock) return { data: await mockFetchCategories(), source: "mock", fallback: false };

  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  
  try {
    const data = await apiGet<any>(`/categories?${q.toString()}`);
    // Se a API retornar o objeto paginado { items: [...] }, extraímos. Se retornar array direto, usamos.
    const items = Array.isArray(data) ? data : (data?.items && Array.isArray(data.items)) ? data.items : [];
    return { data: items, source: "api", fallback: false };
  } catch (error) {
    console.warn("Erro ao buscar categorias da API, usando fallback para mocks:", error);
    if (skipMock) throw error;
    return { data: await mockFetchCategories(), source: "mock", fallback: true };
  }
}

export async function listCategories(params?: { page?: number; pageSize?: number }, skipMock: boolean = false): Promise<Category[]> {
  const result = await listCategoriesWithMeta(params, skipMock);
  if (!result || !result.data) return [];
  return Array.isArray(result.data) ? result.data : [];
}

export async function createCategory(payload: { name: string; description: string }) {
  const forced = getForcedDataSource();
  if (forced === "mock") return Promise.resolve({ id: `mock-${Date.now()}`, ...payload });
  return apiPost<Category>(`/categories`, payload);
}

export async function updateCategory(id: string, payload: { name: string; description: string }) {
  const forced = getForcedDataSource();
  if (forced === "mock") return Promise.resolve();
  return apiPut<void>(`/categories/${id}`, payload);
}

export async function deleteCategory(id: string) {
  const forced = getForcedDataSource();
  if (forced === "mock") return Promise.resolve();
  return apiDelete(`/categories/${id}`);
}

export async function getCategoryById(id: string) {
  return apiGet<Category>(`/categories/${id}`);
}
