"use client";

import { useQuery } from "@tanstack/react-query";
import { listAllOrders } from "@/services/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Wallet, ShoppingBag } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useMemo } from "react";

export default function ClientesPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["all-orders"],
    queryFn: () => listAllOrders()
  });

  const customers = useMemo(() => {
    const map: Record<string, any> = {};
    orders.forEach(o => {
      const uid = o.userId || "guest";
      if (!map[uid]) {
        map[uid] = {
          id: uid,
          orderCount: 0,
          totalSpent: 0,
          lastOrder: o.createdAtUtc,
          status: "active"
        };
      }
      map[uid].orderCount += 1;
      map[uid].totalSpent += o.totalAmount;
      if (new Date(o.createdAtUtc) > new Date(map[uid].lastOrder)) {
        map[uid].lastOrder = o.createdAtUtc;
      }
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <ProtectedRoute requiredRole="admin">
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Base de Clientes</h1>
          <p className="text-sm text-muted-foreground">Análise de comportamento e histórico de compras.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">Com base em pedidos realizados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <Wallet className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(orders.length > 0 ? (orders.reduce((acc, o) => acc + o.totalAmount, 0) / orders.length) : 0)
                  .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-xs text-muted-foreground">Valor médio por pedido</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Frequência</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(customers.length > 0 ? (orders.length / customers.length) : 0).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">Pedidos por cliente</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="py-4 px-4 text-left">Identificador (ID/Username)</th>
                  <th className="py-4 px-4 text-center">Pedidos</th>
                  <th className="py-4 px-4 text-center">Total Gasto</th>
                  <th className="py-4 px-4 text-right">Última Compra</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b"><td colSpan={4} className="py-4 px-4"><Skeleton className="h-8 w-full" /></td></tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">Nenhum cliente identificado ainda.</td></tr>
                ) : (
                  customers.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {c.id.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{c.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-lg">{c.orderCount}</td>
                      <td className="py-4 px-4 text-center font-bold text-emerald-600">
                        {c.totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="py-4 px-4 text-right text-muted-foreground">
                        {new Date(c.lastOrder).toLocaleDateString("pt-BR")}
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
