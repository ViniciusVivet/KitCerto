"use client";

import { useQuery } from "@tanstack/react-query";
import { listOrders } from "@/services/orders";
import { listFavorites } from "@/services/favorites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, ShoppingBag, TrendingUp, ArrowRight, Heart } from "lucide-react";

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function VisaoGeralPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => listOrders(),
  });
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => listFavorites(),
  });

  const totalPedidos = orders.length;
  const statusConcluido = ["approved", "processing", "shipped", "delivered"];
  const pedidosParaTotal = orders.filter((o) => statusConcluido.includes(o.status));
  const totalGasto = pedidosParaTotal.reduce((s, o) => s + o.totalAmount, 0);
  const ultimoPedido = orders.length > 0
    ? [...orders].sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())[0]
    : null;

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">Visão geral</h1>
        <p className="text-sm text-muted-foreground">Resumo da sua conta e atividades recentes.</p>
      </section>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de pedidos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{totalPedidos}</p>
                <p className="text-xs text-muted-foreground">todos os pedidos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total gasto</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{fmt(totalGasto)}</p>
                <p className="text-xs text-muted-foreground">em pedidos pagos ou em andamento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Último pedido</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {ultimoPedido ? (
                  <>
                    <p className="text-lg font-semibold">{ultimoPedido.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ultimoPedido.createdAtUtc).toLocaleDateString("pt-BR")} · {fmt(ultimoPedido.totalAmount)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum pedido ainda</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">Ver todos os pedidos</h3>
                  <p className="text-sm text-muted-foreground">Histórico completo, filtros e repetir compra.</p>
                </div>
                <Button asChild>
                  <Link href="/meus-pedidos" className="gap-2">
                    Meus pedidos <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Favoritos
                  </h3>
                  <p className="text-sm text-muted-foreground">{favorites.length} produto{favorites.length !== 1 ? "s" : ""} salvos.</p>
                </div>
                <Button asChild variant="secondary">
                  <Link href="/meus-pedidos/favoritos" className="gap-2">
                    Ver favoritos <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
