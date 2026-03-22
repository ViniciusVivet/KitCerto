export type Category = { id: string; name: string; description: string };
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
  media?: { url: string; type: string }[];
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
  await Promise.resolve();
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
  await Promise.resolve();
  const list = status ? sellerRequests.filter((s) => s.status === status) : sellerRequests;
  return list;
}

export async function mockApproveSellerRequest(id: string) {
  await Promise.resolve();
  sellerRequests = sellerRequests.map((s) => (s.id === id ? { ...s, status: "approved", reviewedAt: Date.now() } : s));
  return { ok: true };
}

export async function mockRejectSellerRequest(id: string) {
  await Promise.resolve();
  sellerRequests = sellerRequests.map((s) => (s.id === id ? { ...s, status: "rejected", reviewedAt: Date.now() } : s));
  return { ok: true };
}

export const categories: Category[] = [
  { id: "cat-correntes", name: "Correntes", description: "Correntes cravejadas e banhadas a ouro." },
  { id: "cat-relogios", name: "Relógios", description: "Relógios premium cravejados." },
  { id: "cat-brincos", name: "Brincos", description: "Brincos e acessórios." },
  { id: "cat-pulseiras", name: "Pulseiras", description: "Pulseiras e braceletes." },
  { id: "cat-colares", name: "Colares", description: "Colares e pingentes." },
  { id: "cat-cravejados", name: "Cravejados", description: "Peças exclusivamente cravejadas." },
];

export const baseProducts: Product[] = [
  {
    id: "p-1",
    name: "Relógio Esmeralda Clássic Cravejado",
    description: "Relógio clássico cravejado com detalhes esmeralda. Banhado a ouro, caixa cravejada de strass e pulseira de aço inox.",
    price: 249.95,
    stock: 12,
    categoryId: "cat-cravejados",
    sold: 87,
    createdAt: Date.now() - 30 * 86400000,
    media: [{ url: "https://video.wixstatic.com/video/81b41d_301d497d21394d5d95add6eba5e210a5/360p/mp4/file.mp4", type: "video" }],
  },
  {
    id: "p-2",
    name: "Corrente Spike",
    description: "Corrente modelo Spike com pingentes pontiagudos. Acabamento banhado a ouro 18k, estilo street e hip-hop.",
    price: 124.95,
    stock: 20,
    categoryId: "cat-correntes",
    sold: 134,
    createdAt: Date.now() - 60 * 86400000,
    media: [{ url: "https://static.wixstatic.com/media/81b41d_0cc847c766d44119869e2357ca0f8fe2~mv2.png/v1/fill/w_526,h_518,al_c,usm_0.66_1.00_0.01/81b41d_0cc847c766d44119869e2357ca0f8fe2~mv2.png", type: "image" }],
  },
  {
    id: "p-3",
    name: "Corrente Miami Dourada",
    description: "Corrente Miami Cuban Link banhada a ouro 18k. Alta durabilidade e brilho intenso, ideal para o estilo street.",
    price: 149.95,
    stock: 18,
    categoryId: "cat-correntes",
    sold: 210,
    createdAt: Date.now() - 45 * 86400000,
    isPromo: true,
    oldPrice: 174.95,
    media: [{ url: "https://static.wixstatic.com/media/81b41d_ec1818f426154457a793900a37956fb6~mv2.jpg/v1/fill/w_990,h_1036,al_c,q_85,usm_0.66_1.00_0.01/81b41d_ec1818f426154457a793900a37956fb6~mv2.jpg", type: "image" }],
  },
  {
    id: "p-4",
    name: "Corrente Poças",
    description: "Corrente modelo Poças com elos arredondados e acabamento espelhado. Banhada a ouro 18k.",
    price: 99.95,
    stock: 25,
    categoryId: "cat-correntes",
    sold: 156,
    createdAt: Date.now() - 90 * 86400000,
    media: [{ url: "https://static.wixstatic.com/media/81b41d_2c290b703627448c88fc3d9bcf8a2eb7~mv2.png/v1/fill/w_517,h_518,al_c,usm_0.66_1.00_0.01/81b41d_2c290b703627448c88fc3d9bcf8a2eb7~mv2.png", type: "image" }],
  },
  {
    id: "p-5",
    name: "Brinco de Pérola",
    description: "Brinco com pérola sintética de alta qualidade. Peça clássica e elegante, perfeita para qualquer ocasião.",
    price: 44.95,
    stock: 30,
    categoryId: "cat-brincos",
    sold: 98,
    createdAt: Date.now() - 15 * 86400000,
    media: [{ url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop&auto=format", type: "image" }],
  },
  {
    id: "p-6",
    name: "Corrente Ninepac Elegante",
    description: "Corrente Ninepac com design elegante e acabamento premium. Banhada a prata 925, ideal para looks sofisticados.",
    price: 174.95,
    stock: 14,
    categoryId: "cat-correntes",
    sold: 73,
    createdAt: Date.now() - 20 * 86400000,
    media: [{ url: "https://static.wixstatic.com/media/81b41d_6547cd43594d43e7bfe25a31a98ecd85~mv2.png/v1/fill/w_448,h_445,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/81b41d_6547cd43594d43e7bfe25a31a98ecd85~mv2.png", type: "image" }],
  },
  {
    id: "p-7",
    name: "Corrente Miami Cravejada",
    description: "Corrente Miami Cuban Link totalmente cravejada com strass. Banhada a ouro 18k, máximo brilho e estilo.",
    price: 199.95,
    stock: 10,
    categoryId: "cat-cravejados",
    sold: 45,
    createdAt: Date.now() - 10 * 86400000,
    media: [{ url: "https://static.wixstatic.com/media/81b41d_6d685bb85ce74369af8a58d194f7fce1~mv2.png/v1/fill/w_1006,h_1036,al_c,usm_0.66_1.00_0.01/81b41d_6d685bb85ce74369af8a58d194f7fce1~mv2.png", type: "image" }],
  },
  {
    id: "p-8",
    name: "Relógio Desert Clássic Cravejado",
    description: "Relógio Desert com mostrador clássico e caixa cravejada. Pulseira de aço com acabamento champagne, estilo luxo.",
    price: 274.95,
    stock: 8,
    categoryId: "cat-cravejados",
    sold: 62,
    createdAt: Date.now() - 25 * 86400000,
    isPromo: true,
    oldPrice: 314.95,
    media: [{ url: "https://video.wixstatic.com/video/81b41d_4200e0fff4f645f3a63cab8d8f9a3bf3/360p/mp4/file.mp4", type: "video" }],
  },
  {
    id: "p-9",
    name: "Relógio Clássic Cravejado Cyclop",
    description: "Relógio clássico com lente Cyclop cravejada de strass. Design inspirado nos grandes clássicos, reinterpretado com brilho street.",
    price: 224.95,
    stock: 15,
    categoryId: "cat-relogios",
    sold: 119,
    createdAt: Date.now() - 50 * 86400000,
    media: [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format", type: "image" }],
  },
];

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
  await Promise.resolve();
  return { items, total: mockProducts.length, page, pageSize };
}

export async function mockSearchProducts(q?: string, categoryId?: string) {
  const byName = q ? mockProducts.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())) : mockProducts;
  const byCat = categoryId ? byName.filter((p) => p.categoryId === categoryId) : byName;
  await Promise.resolve();
  return { items: byCat, total: byCat.length };
}

export async function mockFetchCategories() {
  await Promise.resolve();
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
  await Promise.resolve();
  return { totalProducts, lowStock, totalValue, byCategory, byCategoryValue, lowStockItems, topProductsByValue, priceBuckets };
}

export async function mockBestSellers(limit = 5) {
  await Promise.resolve();
  return [...mockProducts]
    .map((p) => ({ id: p.id, name: p.name, sold: p.sold ?? 0 }))
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    .slice(0, limit);
}

export async function mockSearchSold(query?: string) {
  await Promise.resolve();
  const filtered = (query
    ? mockProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : mockProducts
  )
    .map((p) => ({ id: p.id, name: p.name, sold: p.sold ?? 0 }))
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
  return { items: filtered, total: filtered.length };
}

export async function mockBestSellingProducts(limit = 10): Promise<Product[]> {
  await Promise.resolve();
  return [...mockProducts]
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    .slice(0, limit);
}

export async function mockLatestProducts(limit = 10): Promise<Product[]> {
  await Promise.resolve();
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
  await Promise.resolve();
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



