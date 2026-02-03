"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import Link from "next/link";
import { getDashboardOverviewWithMeta } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { Package, AlertTriangle, CircleDollarSign, MessageCircle, Store } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/auth";
import { getMySeller } from "@/services/sellers";
import { listProducts } from "@/services/products";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ["sellers", "me"],
    queryFn: getMySeller,
  });
  const isSeller = !!seller;
  const isAdminUser = isAdmin();
  const canAccess = isAdminUser || isSeller;

  const { data: meta, isLoading, error } = useQuery({
    queryKey: ["dash", typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('data') : undefined],
    queryFn: () => getDashboardOverviewWithMeta(true),
    retry: false,
    enabled: isAdminUser,
  });

  const { data: productsMeta } = useQuery({
    queryKey: ["prod-list-dash"],
    queryFn: () => listProducts({ pageSize: 1000 }, true),
    enabled: isAdminUser,
  });

  const data = meta?.data;
  const realProductsCount = productsMeta?.items?.length ?? 0;
  
  const [q, setQ] = React.useState("");
  
  const topProducts = React.useMemo(() => {
    if (!productsMeta?.items) return data?.topProductsByValue ?? [];
    return [...productsMeta.items]
      .map(p => ({ id: p.id, name: p.name, value: p.price * p.stock }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [productsMeta, data]);

  const soldSearch = React.useMemo(() => {
    const list = topProducts;
    if (!q) return list;
    const query = q.toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(query));
  }, [topProducts, q]);

  const byCategory = data?.byCategory ?? [];
  const byCategoryValue = data?.byCategoryValue ?? [];
  const barData = {
    labels: byCategory.map((x) => x.categoryName ?? x.categoryId),
    datasets: [
      {
        label: "Produtos por categoria",
        data: byCategory.map((x) => x.count),
        backgroundColor: [
          "rgba(59,130,246,0.6)",
          "rgba(56,189,248,0.6)",
          "rgba(34,197,94,0.6)",
          "rgba(168,85,247,0.6)",
        ],
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
      },
    ],
  };

  const doughData = {
    labels: byCategory.map((x) => x.categoryName ?? x.categoryId),
    datasets: [
      {
        label: "Distribuição",
        data: byCategory.map((x) => x.count),
        backgroundColor: [
          "rgba(59,130,246,0.7)",
          "rgba(56,189,248,0.7)",
          "rgba(34,197,94,0.7)",
          "rgba(168,85,247,0.7)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutData = doughData; // use the newly created doughData

  const valueBarData = {
    labels: byCategoryValue.map((x) => x.categoryName ?? x.categoryId),
    datasets: [
      {
        label: "Valor do estoque (R$)",
        data: byCategoryValue.map((x) => x.value),
        backgroundColor: "rgba(56,189,248,0.6)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
      },
    ],
  };

  const accessDenied = !sellerLoading && !canAccess;
  const showSellerWelcome = !sellerLoading && isSeller && !isAdminUser;

  return (
    <ProtectedRoute
      unauthTitle="Área restrita"
      unauthMessage="Área para gerenciamento. Faça login para continuar."
    >
      {sellerLoading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {accessDenied && (
        <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-5 lg:px-7">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Acesso negado</h2>
              <p className="text-muted-foreground">
                Esta área é apenas para administradores da plataforma ou para lojas (vendedores) credenciadas.
              </p>
            </CardHeader>
          </Card>
        </div>
      )}

      {showSellerWelcome && (
        <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-5 lg:px-7 space-y-6">
          <section className="rounded-xl border bg-gradient-to-r from-primary/10 via-accent/10 to-transparent p-6">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold">Minha loja</h1>
                <p className="text-sm text-muted-foreground">{seller?.storeName}</p>
              </div>
            </div>
          </section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">Chamados</CardTitle>
              <CardDescription>
                Veja e responda aos chamados dos clientes relacionados à sua loja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gap-2">
                <Link href="/dashboard/chamados">
                  <MessageCircle className="h-4 w-4" /> Ir para chamados
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!sellerLoading && isAdminUser && (
      <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-5 lg:px-7 space-y-8">
      {/* Hero */}
      <section className="rounded-xl border bg-gradient-to-r from-primary/10 via-accent/10 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Insights do catálogo e estoque.</p>
          </div>
          {meta && (
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              Fonte: <strong className={"ml-1 " + (meta.source === 'api' ? 'text-primary' : 'text-accent')}>{meta.source.toUpperCase()}</strong>
              {meta.fallback && <span className="ml-2 rounded bg-accent/20 px-2 py-0.5 text-[10px]">fallback</span>}
            </span>
          )}
        </div>
      </section>

      {/* KPIs com glow */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total de produtos"
          value={isLoading ? "…" : (realProductsCount || data?.totalProducts || "0").toString()}
          icon={<Package className="h-5 w-5 text-primary" />}
        />
        <KpiCard
          title="Baixo estoque"
          value={isLoading ? "…" : data?.lowStock?.toString() ?? "0"}
          icon={<AlertTriangle className="h-5 w-5 text-accent" />}
        />
        <KpiCard
          title="Valor do estoque"
          value={isLoading ? "…" : (data?.totalValue ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={<CircleDollarSign className="h-5 w-5 text-primary" />}
        />
      </section>

      {/* Pesquisar vendidos (prioritário) + Mais vendidos */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-2 text-sm text-muted-foreground">Pesquisar produtos</h3>
          <div className="mb-3"><Input placeholder="Buscar produto..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="max-h-72 overflow-auto rounded-md border">
            <ul className="divide-y">
              {(soldSearch ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between p-3">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="text-sm text-muted-foreground">{p.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-sm text-muted-foreground">Top por valor em estoque</h3>
          <ul className="space-y-2">
            {(topProducts ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-md border p-3">
                <span className="truncate pr-2">{p.name}</span>
                <span className="text-sm text-muted-foreground">{p.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Produtos por categoria */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="p-4">
          <div className="h-64">
            <Bar
              height={250}
              data={barData}
              options={{
                responsive: true,
                plugins: { legend: { display: false }, title: { display: true, text: "Produtos por categoria" } },
                scales: { x: { ticks: { color: "#9CA3AF" } }, y: { ticks: { color: "#9CA3AF" } } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </Card>
        <Card className="p-4">
          <Doughnut
            data={doughnutData}
            options={{
              responsive: true,
              plugins: { legend: { position: "bottom", labels: { color: "#E5E7EB" } }, title: { display: true, text: "Distribuição por categoria" } },
            }}
          />
        </Card>
      </section>

      {/* Valor por categoria + Top 5 valor */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <Bar
            data={valueBarData}
            options={{
              responsive: true,
              plugins: { legend: { display: false }, title: { display: true, text: "Valor do estoque por categoria" } },
              scales: { x: { ticks: { color: "#9CA3AF" } }, y: { ticks: { color: "#9CA3AF" } } },
            }}
          />
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-sm text-muted-foreground">Top 5 por valor em estoque</h3>
          <ul className="space-y-2">
            {(topProducts ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-md border p-3">
                <span className="truncate pr-2">{p.name}</span>
                <span className="font-medium">{p.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* (Seção removida: já movida para cima) */}

      {/* Distribuição de preços + baixo estoque */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-2 text-sm text-muted-foreground">Distribuição de preços (faixas)</h3>
          <div className="h-64">
            <Bar
              height={250}
              data={{
                labels: (data?.priceBuckets ?? []).map((b) => b.label),
                datasets: [{ label: "Produtos", data: (data?.priceBuckets ?? []).map((b) => b.count), backgroundColor: "rgba(168,85,247,0.6)" }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } }, maintainAspectRatio: false }}
            />
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-sm text-muted-foreground">Baixo estoque (&lt; 10)</h3>
          <ul className="space-y-2">
            {(data?.lowStockItems ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-md border p-3">
                <span className="truncate pr-2">{p.name}</span>
                <span className="text-sm text-muted-foreground">{p.stock} un.</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
      </div>
      )}
    </ProtectedRoute>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/10 via-accent/5 to-transparent" />
      <CardHeader className="flex flex-row items-center justify-between text-sm text-muted-foreground">
        <span>{title}</span>
        <span>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}


