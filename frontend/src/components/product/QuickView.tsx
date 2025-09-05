"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import React from "react";
import { useToast } from "@/context/toast";

export function QuickView({ trigger, id, name, price }: { trigger: React.ReactNode; id: string; name: string; price: number }) {
  const { dispatch } = useCart();
  const [qty, setQty] = React.useState(1);
  const [size, setSize] = React.useState<string | null>(null);
  const [color, setColor] = React.useState<string | null>(null);
  const { notify } = useToast();
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Detalhes do produto (mock). Escolha quantidade e adicione ao carrinho.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-3 aspect-video w-full rounded-md bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5" />
          <div className="col-span-1 flex flex-col gap-2">
            <div className="h-16 rounded-md bg-muted" />
            <div className="h-16 rounded-md bg-muted" />
            <div className="h-16 rounded-md bg-muted" />
            <div className="h-16 rounded-md bg-muted" />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Tamanho</div>
            <div className="flex flex-wrap gap-2">
              {["P", "M", "G", "GG"].map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`rounded-md border px-3 py-1 text-sm ${size === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Cor</div>
            <div className="flex flex-wrap gap-2">
              {["Preto", "Branco", "Azul"].map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`rounded-md border px-3 py-1 text-sm ${color === c ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="rounded-md border px-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <span className="w-8 text-center">{qty}</span>
              <button className="rounded-md border px-2" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <span className="text-xl font-semibold">{(price * qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            <DialogClose asChild>
              <Button
                onClick={() => {
                  dispatch({ type: "add", item: { id, name, price, qty } });
                  notify({ title: "Adicionado ao carrinho", description: `${name} (${size ?? "-"}/${color ?? "-"})`, variant: "success" });
                }}
                disabled={!size || !color}
              >
                Adicionar
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


