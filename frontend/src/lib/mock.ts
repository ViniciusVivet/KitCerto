export type Category = { id: string; name: string };
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  sold?: number;
  createdAt?: number;
  isPromo?: boolean;
  oldPrice?: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  date: string; // ISO string
  status: "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
  favorite?: boolean;
  shipping: {
    address: string;
    method: string;
    eta: string;
    trackingCode?: string;
  };
  payment: {
    method: string;
    installments?: number;
  };
};

// -------- Seller Requests (mock) --------
export type SellerRequest = {
  id: string;
  userId: string;
  email: string;
  storeName: string;
  phone?: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  reviewedAt?: number;
};

let sellerRequests: SellerRequest[] = [];

export async function mockCreateSellerRequest(req: Omit<SellerRequest, "id" | "status" | "createdAt">) {
  await new Promise((r) => setTimeout(r, 200));
  const item: SellerRequest = {
    id: `SR-${Date.now()}`,
    status: "pending",
    createdAt: Date.now(),
    ...req,
  };
  sellerRequests.unshift(item);
  return item;
}

export async function mockListSellerRequests(status?: SellerRequest["status"]) {
  await new Promise((r) => setTimeout(r, 150));
  const list = status ? sellerRequests.filter((s) => s.status === status) : sellerRequests;
  return list;
}

export async function mockApproveSellerRequest(id: string) {
  await new Promise((r) => setTimeout(r, 150));
  sellerRequests = sellerRequests.map((s) => (s.id === id ? { ...s, status: "approved", reviewedAt: Date.now() } : s));
  return { ok: true };
}

export async function mockRejectSellerRequest(id: string) {
  await new Promise((r) => setTimeout(r, 150));
  sellerRequests = sellerRequests.map((s) => (s.id === id ? { ...s, status: "rejected", reviewedAt: Date.now() } : s));
  return { ok: true };
}

export const categories: Category[] = [
  { id: "cat-street", name: "Street" },
  { id: "cat-joias", name: "Jóias" },
  { id: "cat-semi", name: "Semi-jóias" },
  { id: "cat-outfits", name: "Outfits" },
];

const kinds = [
  { label: "Corrente", price: 199.9 },
  { label: "Relógio", price: 499.9 },
  { label: "Pulseira", price: 129.9 },
  { label: "Boné", price: 89.9 },
  { label: "Calça", price: 229.9 },
  { label: "Camiseta", price: 149.9 },
];

export const baseProducts: Product[] = Array.from({ length: 24 }).map((_, i) => {
  const kind = kinds[i % kinds.length];
  const isPromo = i % 5 === 0;
  const oldPrice = isPromo ? Math.round(kind.price * 1.15 * 100) / 100 : undefined;
  return {
    id: `p-${i + 1}`,
    name: `${kind.label} Neon KitCerto ${i + 1}`,
    description: `${kind.label} com vibe streetwear e acabamento premium.`,
    price: kind.price,
    stock: 5 + (i % 12),
    categoryId: categories[(i % categories.length)].id,
    sold: 10 + ((i * 7) % 300),
    createdAt: Date.now() - i * 86400000,
    isPromo,
    oldPrice,
  };
});

// Estado mutável para operações de CRUD no modo mock
let mockProducts: Product[] = [...baseProducts];

export function getMockProducts() {
  return mockProducts;
}

export function mockCreateProduct(payload: Partial<Product>) {
  const id = payload.id || `p-${Date.now()}`;
  const product: Product = {
    id,
    name: payload.name || "Novo produto",
    description: payload.description || "",
    price: payload.price ?? 0,
    stock: payload.stock ?? 0,
    categoryId: payload.categoryId || categories[0].id,
    sold: payload.sold ?? 0,
    createdAt: Date.now(),
  };
  mockProducts = [product, ...mockProducts];
  return product;
}

export function mockUpdateProduct(id: string, payload: Partial<Product>) {
  mockProducts = mockProducts.map((p) => (p.id === id ? { ...p, ...payload, id: p.id } : p));
  return mockProducts.find((p) => p.id === id);
}

export function mockDeleteProduct(id: string) {
  mockProducts = mockProducts.filter((p) => p.id !== id);
  return { ok: true };
}

export async function mockFetchProducts(params?: { page?: number; pageSize?: number }) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const items = mockProducts.slice(start, start + pageSize);
  await new Promise((r) => setTimeout(r, 300));
  return { items, total: mockProducts.length, page, pageSize };
}

export async function mockSearchProducts(q?: string, categoryId?: string) {
  const byName = q ? mockProducts.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())) : mockProducts;
  const byCat = categoryId ? byName.filter((p) => p.categoryId === categoryId) : byName;
  await new Promise((r) => setTimeout(r, 200));
  return { items: byCat, total: byCat.length };
}

export async function mockFetchCategories() {
  await new Promise((r) => setTimeout(r, 150));
  return categories;
}

export async function mockDashboard() {
  const totalProducts = mockProducts.length;
  const lowStock = mockProducts.filter((p) => p.stock < 10).length;
  const totalValue = mockProducts.reduce((acc, p) => acc + p.price * p.stock, 0);
  const byCategory = categories.map((c) => ({
    categoryId: c.id,
    categoryName: c.name,
    count: mockProducts.filter((p) => p.categoryId === c.id).length,
  }));
  const byCategoryValue = categories.map((c) => ({
    categoryId: c.id,
    categoryName: c.name,
    value: mockProducts
      .filter((p) => p.categoryId === c.id)
      .reduce((acc, p) => acc + p.price * p.stock, 0),
  }));
  const lowStockItems = mockProducts.filter((p) => p.stock < 10).slice(0, 10);
  const topProductsByValue = [...mockProducts]
    .map((p) => ({ id: p.id, name: p.name, value: p.price * p.stock }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const priceBuckets = [
    { label: "0–99", min: 0, max: 99 },
    { label: "100–199", min: 100, max: 199 },
    { label: "200–299", min: 200, max: 299 },
    { label: "300–499", min: 300, max: 499 },
    { label: "500+", min: 500, max: Infinity },
  ].map((b) => ({
    label: b.label,
    count: baseProducts.filter((p) => p.price >= b.min && p.price <= (b.max === Infinity ? p.price : b.max)).length,
  }));
  await new Promise((r) => setTimeout(r, 250));
  return { totalProducts, lowStock, totalValue, byCategory, byCategoryValue, lowStockItems, topProductsByValue, priceBuckets };
}

export async function mockBestSellers(limit = 5) {
  await new Promise((r) => setTimeout(r, 200));
  return [...mockProducts]
    .map((p) => ({ id: p.id, name: p.name, sold: p.sold ?? 0 }))
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    .slice(0, limit);
}

export async function mockSearchSold(query?: string) {
  await new Promise((r) => setTimeout(r, 200));
  const filtered = (query
    ? mockProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : mockProducts
  )
    .map((p) => ({ id: p.id, name: p.name, sold: p.sold ?? 0 }))
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
  return { items: filtered, total: filtered.length };
}

export async function mockBestSellingProducts(limit = 10): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...mockProducts]
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    .slice(0, limit);
}

export async function mockLatestProducts(limit = 10): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...mockProducts]
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, limit);
}

// ------- Orders (mock) -------

function buildOrderFromProducts(seed: number): Order {
  const p1 = baseProducts[seed % baseProducts.length];
  const p2 = baseProducts[(seed + 5) % baseProducts.length];
  const p3 = baseProducts[(seed + 11) % baseProducts.length];
  const items: OrderItem[] = [
    { productId: p1.id, name: p1.name, unitPrice: p1.price, quantity: 1 + (seed % 2) },
    { productId: p2.id, name: p2.name, unitPrice: p2.price, quantity: 1 },
    { productId: p3.id, name: p3.name, unitPrice: p3.price, quantity: 1 },
  ];
  const total = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const statuses: Order["status"][] = ["processing", "shipped", "delivered", "cancelled"];
  return {
    id: `O-${10000 + seed}`,
    date: new Date(Date.now() - seed * 86400000).toISOString(),
    status: statuses[seed % statuses.length],
    total,
    items,
    shipping: {
      address: "Rua KitCerto, 123 - São Paulo / SP",
      method: "Sedex",
      eta: new Date(Date.now() + 3 * 86400000).toISOString(),
      trackingCode: `BR${seed}SPX`,
    },
    payment: {
      method: "Cartão de crédito",
      installments: (seed % 3) + 1,
    },
  };
}

const ordersData: Order[] = Array.from({ length: 12 }).map((_, i) => buildOrderFromProducts(i));

export async function mockFetchOrders(params?: { status?: Order["status"]; q?: string; days?: number }) {
  await new Promise((r) => setTimeout(r, 250));
  let list = [...ordersData];
  if (params?.status) list = list.filter((o) => o.status === params.status);
  if (params?.days) {
    const cutoff = Date.now() - params.days * 86400000;
    list = list.filter((o) => new Date(o.date).getTime() >= cutoff);
  }
  if (params?.q) {
    const q = params.q.toLowerCase();
    list = list.filter((o) => o.id.toLowerCase().includes(q) || o.items.some((it) => it.name.toLowerCase().includes(q)));
  }
  return list;
}



