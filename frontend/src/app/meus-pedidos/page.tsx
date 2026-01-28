"use client";

import { useQuery } from "@tanstack/react-query";
import { listOrders, type Order } from "@/services/orders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, Package, Heart, MapPin, CreditCard, Ticket, User, LifeBuoy } from "lucide-react";
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCart } from "@/context/cart";
import { useToast } from "@/context/toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function StatusBadge({ s }: { s: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    processing: "bg-yellow-500/20 text-yellow-400",
    shipped: "bg-blue-500/20 text-blue-400",
    delivered: "bg-emerald-500/20 text-emerald-400",
    cancelled: "bg-red-500/20 text-red-400",
  };
  return <span className={`rounded px-2 py-1 text-xs ${map[s]}`}>{s}</span>;
}

export default function OrdersPage() {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<Order["status"] | undefined>(undefined);
  const [days, setDays] = React.useState<number | undefined>(180);

  const { data: orders, isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => listOrders() });
  const { dispatch } = useCart();
  const { notify } = useToast();

  return (
    <ProtectedRoute unauthTitle="Entre para ver seus pedidos" unauthMessage="Faça login para consultar e acompanhar seus pedidos.">
      <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-5 lg:px-7">
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">Meus pedidos</h1>
        <p className="text-sm text-muted-foreground">Acompanhe seus pedidos, favorite e repita compras.</p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar do comprador */}
        <aside className="hidden md:block space-y-4 rounded-xl border p-3 sticky top-24 h-max">
          <nav className="space-y-1">
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2"><Home className="h-4 w-4" /> Visão geral</Button>
            </Link>
            <Link href="/meus-pedidos" className="block">
              <Button variant="secondary" className="w-full justify-start gap-2"><Package className="h-4 w-4" /> Meus pedidos</Button>
            </Link>
            <Link href="#" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2"><Heart className="h-4 w-4" /> Favoritos</Button>
            </Link>
            <Link href="#" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2"><MapPin className="h-4 w-4" /> Endereços</Button>
            </Link>
            <Link href="#" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2"><CreditCard className="h-4 w-4" /> Pagamentos</Button>
            </Link>
            <Link href="#" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2"><Ticket className="h-4 w-4" /> Cupons</Button>
            </Link>
            <Link href="#" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2"><User className="h-4 w-4" /> Dados pessoais</Button>
            </Link>
            <Link href="#" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2"><LifeBuoy className="h-4 w-4" /> Suporte</Button>
            </Link>
          </nav>
        </aside>

        {/* Conteúdo principal */}
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Input placeholder="Buscar por código ou item…" value={q} onChange={(e) => setQ(e.target.value)} className="w-full sm:w-80" />
            <div className="flex flex-wrap items-center gap-2">
              {[undefined, "processing", "shipped", "delivered", "cancelled"].map((s, idx) => (
                <Badge key={idx} className={`${status === s ? "bg-primary text-primary-foreground" : "cursor-pointer"}`} onClick={() => setStatus(s as any)}>
                  {s ?? "Todos"}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Button variant={days === 30 ? "default" : "secondary"} onClick={() => setDays(30)}>30 dias</Button>
              <Button variant={days === 90 ? "default" : "secondary"} onClick={() => setDays(90)}>90 dias</Button>
              <Button variant={days === 180 ? "default" : "secondary"} onClick={() => setDays(180)}>180 dias</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <Card key={`sk-${i}`} className="h-28 animate-pulse" />
            ))}
            {!isLoading && (orders ?? []).length === 0 && (
              <Card className="p-6">
                <div className="text-center text-muted-foreground">
                  Você ainda não possui pedidos.
                </div>
              </Card>
            )}
            {!isLoading && (orders ?? [])
              .filter((o) => (status ? o.status === status : true))
              .filter((o) => (days ? (Date.now() - new Date(o.createdAtUtc).getTime()) <= days * 86400000 : true))
              .filter((o) => (q ? (o.id.toLowerCase().includes(q.toLowerCase()) || o.items.some((it) => it.name.toLowerCase().includes(q.toLowerCase()))) : true))
              .map((o) => (
              <Card key={o.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{o.id}</h3>
                      <StatusBadge s={o.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(o.createdAtUtc).toLocaleDateString("pt-BR")} • {o.items.length} itens</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{o.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    <OrderDetails order={o} />
                    <Button onClick={() => {
                      o.items.forEach(it => dispatch({ type: "add", item: { id: it.productId, name: it.name, price: it.unitPrice, qty: it.quantity } }));
                      notify({ title: "Itens adicionados ao carrinho", description: `Pedido ${o.id}`, variant: "success" });
                    }}>Repetir compra</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      </div>
    </ProtectedRoute>
  );
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Detalhes</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pedido {order.id}</DialogTitle>
          <DialogDescription>
            {new Date(order.createdAtUtc).toLocaleString("pt-BR")} • <StatusBadge s={order.status} />
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <section>
            <h4 className="mb-2 text-sm font-medium">Itens</h4>
            <ul className="divide-y rounded-md border">
              {order.items.map((it) => (
                <li key={it.productId} className="flex items-center justify-between p-3 text-sm">
                  <span className="truncate pr-2">{it.name} × {it.quantity}</span>
                  <span>{(it.unitPrice * it.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-md border p-3 text-sm">
              <h5 className="mb-1 font-medium">Entrega</h5>
              <p className="text-muted-foreground">{order.shipping?.addressLine}</p>
              <p className="text-muted-foreground">{order.shipping?.city} / {order.shipping?.state}</p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <h5 className="mb-1 font-medium">Pagamento</h5>
              <p className="text-muted-foreground">Mercado Pago</p>
              <p className="font-semibold">Total {order.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}


