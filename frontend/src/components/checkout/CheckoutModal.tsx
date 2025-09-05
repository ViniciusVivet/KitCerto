"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { useToast } from "@/context/toast";
import { useCart } from "@/context/cart";

export function CheckoutModal({ trigger }: { trigger: React.ReactNode }) {
  const { state, subtotal } = useCart();
  const { notify } = useToast();
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [coupon, setCoupon] = React.useState("");
  const discount = coupon === "KIT10" ? subtotal * 0.1 : 0;
  const shipping = subtotal > 300 ? 0 : 19.9;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>Fluxo simulado para finalizar sua compra.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {step === 1 && (
            <section className="space-y-3">
              <h4 className="text-sm font-medium">Endereço</h4>
              <Input placeholder="Rua" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Cidade" />
                <Input placeholder="UF" />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>Continuar</Button>
              </div>
            </section>
          )}
          {step === 2 && (
            <section className="space-y-3">
              <h4 className="text-sm font-medium">Frete</h4>
              <div className="rounded-md border p-3 text-sm">
                <p>Sedex (2-3 dias úteis) — {shipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              </div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
                <Button onClick={() => setStep(3)}>Continuar</Button>
              </div>
            </section>
          )}
          {step === 3 && (
            <section className="space-y-3">
              <h4 className="text-sm font-medium">Pagamento</h4>
              <Input placeholder="Número do cartão (mock)" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Validade" />
                <Input placeholder="CVV" />
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Cupom (ex.: KIT10)" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                <Button variant="secondary" onClick={() => notify({ title: coupon === "KIT10" ? "Cupom aplicado" : "Cupom inválido", description: coupon || "Nenhum cupom informado", variant: coupon === "KIT10" ? "success" : "error" })}>Aplicar</Button>
              </div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
                <Button onClick={() => setStep(4)}>Revisar</Button>
              </div>
            </section>
          )}
          {step === 4 && (
            <section className="space-y-3">
              <h4 className="text-sm font-medium">Revisão</h4>
              <ul className="divide-y rounded-md border text-sm">
                {state.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between p-3">
                    <span className="truncate pr-2">{i.name} × {i.qty}</span>
                    <span>{(i.price * i.qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </li>
                ))}
              </ul>
              <div className="text-sm text-muted-foreground">Subtotal {subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
              <div className="text-sm text-muted-foreground">Frete {shipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
              <div className="text-sm text-muted-foreground">Desconto {discount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
              <div className="font-semibold">Total {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(3)}>Voltar</Button>
                <DialogClose asChild>
                  <Button onClick={() => notify({ title: "Pedido confirmado", description: "Compra finalizada (mock)", variant: "success" })}>Confirmar</Button>
                </DialogClose>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


