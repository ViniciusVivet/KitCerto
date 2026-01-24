import { apiGet, apiPost } from "@/lib/api";

export type OrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type OrderShipping = {
  addressLine: string;
  city: string;
  state: string;
};

export type Order = {
  id: string;
  status: string;
  currency: string;
  totalAmount: number;
  createdAtUtc: string;
  items: OrderItem[];
  shipping?: OrderShipping | null;
};

export async function listOrders(): Promise<Order[]> {
  return apiGet<Order[]>(`/orders`);
}

export async function createOrderCheckout(payload: {
  items: { productId: string; quantity: number }[];
  shipping?: OrderShipping;
}): Promise<{ orderId: string; totalAmount: number; currency: string; checkoutUrl: string }> {
  return apiPost(`/orders/checkout`, payload);
}
