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
  /** Presente em listAllOrders (admin). */
  userId?: string | null;
};

export async function listOrders(): Promise<Order[]> {
  return apiGet<Order[]>(`/orders`);
}

export async function listAllOrders(): Promise<Order[]> {
  return apiGet<Order[]>(`/orders/all`);
}

/** Pedidos que contêm produtos da loja do vendedor (GET /sellers/me/orders). */
export async function listSellerOrders(): Promise<Order[]> {
  return apiGet<Order[]>(`/sellers/me/orders`);
}

export async function createOrderCheckout(payload: {
  items: { productId: string; quantity: number }[];
  shipping?: OrderShipping;
  couponCode?: string | null;
}): Promise<{ orderId: string; totalAmount: number; currency: string; checkoutUrl: string }> {
  return apiPost(`/orders/checkout`, payload);
}
