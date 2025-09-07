import { apiPost, apiGet } from "@/lib/api";
import { useMocks } from "@/lib/config";
import { mockCreateSellerRequest, mockListSellerRequests, mockApproveSellerRequest, mockRejectSellerRequest, type SellerRequest } from "@/lib/mock";

export async function createSellerRequest(payload: { userId: string; email: string; storeName: string; phone?: string; description?: string; }) {
  if (useMocks) return mockCreateSellerRequest(payload);
  return apiPost<SellerRequest>(`/api/sellers/requests`, payload);
}

export async function listSellerRequests(status?: SellerRequest["status"]) {
  if (useMocks) return mockListSellerRequests(status);
  const q = status ? `?status=${status}` : "";
  return apiGet<SellerRequest[]>(`/api/sellers/requests${q}`);
}

export async function approveSellerRequest(id: string) {
  if (useMocks) return mockApproveSellerRequest(id);
  return apiPost(`/api/sellers/requests/${id}/approve`, {});
}

export async function rejectSellerRequest(id: string) {
  if (useMocks) return mockRejectSellerRequest(id);
  return apiPost(`/api/sellers/requests/${id}/reject`, {});
}


