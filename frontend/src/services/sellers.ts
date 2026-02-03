import { apiPost, apiGet } from "@/lib/api";
import { useMocks } from "@/lib/config";
import {
  mockCreateSellerRequest,
  mockListSellerRequests,
  mockApproveSellerRequest,
  mockRejectSellerRequest,
  type SellerRequest,
} from "@/lib/mock";

type DataSource = "api" | "mock";

function getForcedDataSource(): DataSource | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const raw = (url.searchParams.get("data") || url.searchParams.get("ds") || "").toLowerCase();
  if (raw === "api" || raw === "mock") return raw;
  return null;
}

function shouldUseMocks(): boolean {
  const forced = getForcedDataSource();
  return useMocks || forced === "mock";
}

export async function createSellerRequest(payload: { userId: string; email: string; storeName: string; phone?: string; description?: string; }) {
  if (shouldUseMocks()) return mockCreateSellerRequest(payload);
  try {
    return await apiPost<SellerRequest>(`/sellers/requests`, payload);
  } catch (error) {
    console.warn("Erro ao criar solicitação de vendedor na API, usando mock:", error);
    return mockCreateSellerRequest(payload);
  }
}

export async function listSellerRequests(status?: SellerRequest["status"]) {
  if (shouldUseMocks()) return mockListSellerRequests(status);
  const q = status ? `?status=${status}` : "";
  try {
    return await apiGet<SellerRequest[]>(`/sellers/requests${q}`);
  } catch (error) {
    console.warn("Erro ao listar solicitações de vendedor na API, usando mock:", error);
    return mockListSellerRequests(status);
  }
}

export async function approveSellerRequest(id: string) {
  if (shouldUseMocks()) return mockApproveSellerRequest(id);
  try {
    return await apiPost(`/sellers/requests/${id}/approve`, {});
  } catch (error) {
    console.warn("Erro ao aprovar solicitação na API, usando mock:", error);
    return mockApproveSellerRequest(id);
  }
}

export async function rejectSellerRequest(id: string) {
  if (shouldUseMocks()) return mockRejectSellerRequest(id);
  try {
    return await apiPost(`/sellers/requests/${id}/reject`, {});
  } catch (error) {
    console.warn("Erro ao rejeitar solicitação na API, usando mock:", error);
    return mockRejectSellerRequest(id);
  }
}

export type SellerMe = { id: string; storeName: string; email: string };

export async function getMySeller(): Promise<SellerMe | null> {
  if (shouldUseMocks()) return null;
  try {
    return await apiGet<SellerMe>(`/sellers/me`);
  } catch {
    return null;
  }
}


