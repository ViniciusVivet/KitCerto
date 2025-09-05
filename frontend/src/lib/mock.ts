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

const baseProducts: Product[] = Array.from({ length: 24 }).map((_, i) => {
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

export async function mockFetchProducts(params?: { page?: number; pageSize?: number }) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const items = baseProducts.slice(start, start + pageSize);
  await new Promise((r) => setTimeout(r, 300));
  return { items, total: baseProducts.length, page, pageSize };
}

export async function mockSearchProducts(q?: string, categoryId?: string) {
  const byName = q ? baseProducts.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())) : baseProducts;
  const byCat = categoryId ? byName.filter((p) => p.categoryId === categoryId) : byName;
  await new Promise((r) => setTimeout(r, 200));
  return { items: byCat, total: byCat.length };
}

export async function mockFetchCategories() {
  await new Promise((r) => setTimeout(r, 150));
  return categories;
}

export async function mockDashboard() {
  const totalProducts = baseProducts.length;
  const lowStock = baseProducts.filter((p) => p.stock < 10).length;
  const totalValue = baseProducts.reduce((acc, p) => acc + p.price * p.stock, 0);
  const byCategory = categories.map((c) => ({
    categoryId: c.id,
    categoryName: c.name,
    count: baseProducts.filter((p) => p.categoryId === c.id).length,
  }));
  const byCategoryValue = categories.map((c) => ({
    categoryId: c.id,
    categoryName: c.name,
    value: baseProducts
      .filter((p) => p.categoryId === c.id)
      .reduce((acc, p) => acc + p.price * p.stock, 0),
  }));
  const lowStockItems = baseProducts.filter((p) => p.stock < 10).slice(0, 10);
  const topProductsByValue = [...baseProducts]
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
  return [...baseProducts]
    .map((p) => ({ id: p.id, name: p.name, sold: p.sold ?? 0 }))
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    .slice(0, limit);
}

export async function mockSearchSold(query?: string) {
  await new Promise((r) => setTimeout(r, 200));
  const filtered = (query
    ? baseProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : baseProducts
  )
    .map((p) => ({ id: p.id, name: p.name, sold: p.sold ?? 0 }))
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
  return { items: filtered, total: filtered.length };
}

export async function mockBestSellingProducts(limit = 10): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...baseProducts]
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    .slice(0, limit);
}

export async function mockLatestProducts(limit = 10): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...baseProducts]
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



