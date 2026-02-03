import { apiDelete, apiGet, apiPost } from "@/lib/api";

export type PaymentMethod = {
  id: string;
  last4: string;
  brand: string;
  isDefault: boolean;
};

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  return apiGet<PaymentMethod[]>(`/me/payment-methods`);
}

export async function addPaymentMethod(payload: {
  token: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ id: string; last4: string; brand: string }> {
  return apiPost<{ id: string; last4: string; brand: string }>(`/me/payment-methods`, payload);
}

export async function deletePaymentMethod(id: string): Promise<void> {
  return apiDelete(`/me/payment-methods/${id}`);
}
