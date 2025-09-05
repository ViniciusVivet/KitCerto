"use client";

import { useQuery } from "@tanstack/react-query";
import { mockFetchOrders, type Order } from "@/lib/mock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCart } from "@/context/cart";
import { useToast } from "@/context/toast";

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

  const { data: orders, isLoading } = useQuery({ queryKey: ["orders", q, status, days], queryFn: () => mockFetchOrders({ q, status, days }) });
  const { dispatch } = useCart();
  const { notify } = useToast();

  return (
    <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-5 lg:px-7">
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">Meus pedidos</h1>
        <p className="text-sm text-muted-foreground">Acompanhe seus pedidos, favorite e repita compras.</p>
      </section>

      <section className="mb-4 flex flex-wrap items-center gap-2">
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
      </section>

      <section className="grid grid-cols-1 gap-4">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Card key={`sk-${i}`} className="h-28 animate-pulse" />
        ))}
        {!isLoading && (orders ?? []).map((o) => (
          <Card key={o.id} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{o.id}</h3>
                  <StatusBadge s={o.status} />
                </div>
                <p className="text-sm text-muted-foreground">{new Date(o.date).toLocaleDateString("pt-BR")} • {o.items.length} itens</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{o.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                <OrderDetails order={o} />
                <Button onClick={() => {
                  o.items.forEach(it => dispatch({ type: "add", item: { id: it.productId, name: it.name, price: it.unitPrice, qty: it.quantity } }));
                  notify({ title: "Itens adicionados ao carrinho", description: `Pedido ${o.id}`, variant: "success" });
                }}>Repetir compra</Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
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
            {new Date(order.date).toLocaleString("pt-BR")} • <StatusBadge s={order.status} />
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
              <p className="text-muted-foreground">{order.shipping.address}</p>
              <p className="text-muted-foreground">{order.shipping.method} • ETA {new Date(order.shipping.eta).toLocaleDateString("pt-BR")}</p>
              {order.shipping.trackingCode && <p className="text-muted-foreground">Tracking: {order.shipping.trackingCode}</p>}
            </div>
            <div className="rounded-md border p-3 text-sm">
              <h5 className="mb-1 font-medium">Pagamento</h5>
              <p className="text-muted-foreground">{order.payment.method}{order.payment.installments ? ` • ${order.payment.installments}x` : ""}</p>
              <p className="font-semibold">Total {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}


