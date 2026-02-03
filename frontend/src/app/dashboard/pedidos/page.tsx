"use client";

import { useQuery } from "@tanstack/react-query";
import { listAllOrders, listSellerOrders } from "@/services/orders";
import { getMySeller } from "@/services/sellers";
import { useAuth } from "@/context/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Clock, CreditCard, MapPin, Eye } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export default function PedidosPage() {
  const { isAdmin } = useAuth();
  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ["sellers", "me"],
    queryFn: getMySeller,
  });
  const isSeller = !!seller;
  const canAccess = isAdmin() || isSeller;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: isAdmin() ? ["all-orders"] : ["seller-orders"],
    queryFn: () => (isAdmin() ? listAllOrders() : listSellerOrders()),
    enabled: canAccess,
  });

  const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + o.totalAmount, 0), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => o.status === "pending_payment").length, [orders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment": return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Aguardando Pagamento</Badge>;
      case "paid":
      case "approved": return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Pago</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const accessDenied = !sellerLoading && !canAccess;

  if (accessDenied) {
    return (
      <ProtectedRoute>
        <Card className="m-6 p-6">
          <h2 className="text-xl font-semibold">Acesso negado</h2>
          <p className="text-muted-foreground mt-2">Esta área é apenas para administradores ou lojas credenciadas.</p>
        </Card>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <section className="space-y-6 px-4 py-6 sm:px-5 lg:px-7">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{isAdmin() ? "Gestão de Pedidos" : "Pedidos"}</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin() ? "Visualize e gerencie todas as vendas da plataforma." : "Pedidos que contêm produtos da sua loja."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <CreditCard className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-xs text-muted-foreground">Total bruto processado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Aguardando confirmação de PGTO</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">Volume total de transações</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="py-4 px-4 text-left">ID do Pedido</th>
                  <th className="py-4 px-4 text-left">Data</th>
                  <th className="py-4 px-4 text-left">Status</th>
                  <th className="py-4 px-4 text-left">Total</th>
                  <th className="py-4 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b"><td colSpan={5} className="py-4 px-4"><Skeleton className="h-8 w-full" /></td></tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Nenhum pedido realizado até o momento.</td></tr>
                ) : (
                  orders.map((o: any) => (
                    <tr key={o.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-4 font-mono text-xs text-primary">{o.id}</td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {new Date(o.createdAtUtc).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(o.status)}</td>
                      <td className="py-4 px-4 font-bold">
                        {o.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button size="sm" variant="ghost" className="gap-2">
                          <Eye className="h-4 w-4" /> Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </ProtectedRoute>
  );
}
