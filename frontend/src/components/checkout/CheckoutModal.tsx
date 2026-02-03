"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { useToast } from "@/context/toast";
import { useCart } from "@/context/cart";
import { useAuth } from "@/context/auth";
import { LoginButton } from "@/components/auth/LoginButton";
import { createOrderCheckout } from "@/services/orders";
import { getSettings } from "@/services/settings";
import { listActiveCoupons, type Coupon } from "@/services/coupons";
import { useQuery } from "@tanstack/react-query";

function parseCheckoutError(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as Error).message === "string") {
    const msg = (err as Error).message;
    try {
      const parsed = JSON.parse(msg);
      if (parsed?.message) return parsed.message;
      if (parsed?.errorMessage) return parsed.errorMessage;
    } catch {
      // não é JSON
    }
    return msg;
  }
  return "Erro inesperado. Tente novamente.";
}

const VIA_CEP_URL = "https://viacep.com.br/ws";

async function fetchCep(cep: string): Promise<{ logradouro: string; bairro: string; localidade: string; uf: string } | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const res = await fetch(`${VIA_CEP_URL}/${digits}/json/`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.erro) return null;
  return {
    logradouro: data.logradouro ?? "",
    bairro: data.bairro ?? "",
    localidade: data.localidade ?? "",
    uf: data.uf ?? "",
  };
}

export function CheckoutModal({ trigger }: { trigger: React.ReactNode }) {
  const { state, subtotal, dispatch } = useCart();
  const { notify } = useToast();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [couponInput, setCouponInput] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
  const [cep, setCep] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [complement, setComplement] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");
  const [uf, setUf] = React.useState("");
  const [cepLoading, setCepLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data: couponsList = [] } = useQuery({ queryKey: ["coupons"], queryFn: listActiveCoupons });

  const freeShippingThreshold = settings?.freeShippingThreshold ?? 250;
  const shippingValue = subtotal >= freeShippingThreshold ? 0 : 19.9;
  const shipping = shippingValue;

  const discountAmount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    const minOk = subtotal >= (appliedCoupon.minOrderValue ?? 0);
    if (!minOk) return 0;
    if (appliedCoupon.discountType === "fixed")
      return Math.min(Number(appliedCoupon.discountValue), subtotal);
    return subtotal * (Number(appliedCoupon.discountValue) / 100);
  }, [appliedCoupon, subtotal]);

  const discount = discountAmount;
  const total = Math.max(0, subtotal - discount + shipping);

  const addressLineForApi = React.useMemo(() => {
    const parts = [street?.trim(), number?.trim()].filter(Boolean);
    if (complement?.trim()) parts.push(complement.trim());
    if (neighborhood?.trim()) parts.push(neighborhood.trim());
    return parts.length ? parts.join(", ") : (street?.trim() || "");
  }, [street, number, complement, neighborhood]);

  const canContinueAddress = Boolean(street?.trim() && city?.trim() && uf?.trim() && number?.trim());

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const data = await fetchCep(cep);
      if (data) {
        setStreet(data.logradouro);
        setNeighborhood(data.bairro);
        setCity(data.localidade);
        setUf(data.uf);
      }
    } catch {
      // ignore
    } finally {
      setCepLoading(false);
    }
  }

  function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      notify({ title: "Informe o cupom", variant: "error" });
      return;
    }
    const coupon = couponsList.find((c) => (c.code ?? "").toUpperCase() === code);
    if (!coupon) {
      notify({ title: "Cupom não encontrado", variant: "error" });
      setAppliedCoupon(null);
      return;
    }
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    if (now < validFrom || now > validUntil) {
      notify({ title: "Cupom expirado ou fora do período", variant: "error" });
      setAppliedCoupon(null);
      return;
    }
    const used = coupon.usedCount ?? 0;
    const max = coupon.maxUses ?? 0;
    if (max > 0 && used >= max) {
      notify({ title: "Cupom esgotado", variant: "error" });
      setAppliedCoupon(null);
      return;
    }
    const minOrder = Number(coupon.minOrderValue ?? 0);
    if (subtotal < minOrder) {
      notify({
        title: "Pedido mínimo",
        description: `Este cupom exige pedido mínimo de ${minOrder.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        variant: "error",
      });
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
    notify({ title: "Cupom aplicado", description: coupon.code, variant: "success" });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Preencha o endereço e revise os itens. O pagamento será feito na página segura do Mercado Pago.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {step === 1 && (
            <section className="space-y-3">
              {!isAuthenticated ? (
                <div className="rounded-md border p-4 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">Faça login para finalizar a compra.</p>
                  <LoginButton />
                </div>
              ) : (
                <>
                  <h4 className="text-sm font-medium">Endereço de entrega</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="CEP"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      onBlur={handleCepBlur}
                      disabled={cepLoading}
                      maxLength={9}
                    />
                    <Input placeholder="Número" value={number} onChange={(e) => setNumber(e.target.value)} className="col-span-2" />
                  </div>
                  <Input placeholder="Rua" value={street} onChange={(e) => setStreet(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Complemento" value={complement} onChange={(e) => setComplement(e.target.value)} />
                    <Input placeholder="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                    <Input placeholder="UF" value={uf} onChange={(e) => setUf(e.target.value)} maxLength={2} />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setStep(2)} disabled={!canContinueAddress}>Continuar</Button>
                  </div>
                </>
              )}
            </section>
          )}
          {step === 2 && (
            <section className="space-y-3">
              <h4 className="text-sm font-medium">Frete</h4>
              <div className="rounded-md border p-3 text-sm">
                <p>
                  Sedex (2-3 dias úteis) — {shipping > 0 ? shipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Grátis"}
                </p>
                {subtotal < freeShippingThreshold && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Frete grátis em compras acima de {freeShippingThreshold.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                )}
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
              <p className="text-sm text-muted-foreground rounded-md border p-3 bg-muted/50">
                O pagamento (cartão de crédito/débito ou PIX) será realizado na página segura do Mercado Pago após você clicar em <strong>Revisar</strong> e <strong>Confirmar</strong>.
              </p>
              <p className="text-xs text-muted-foreground">
                Cartões salvos em <strong>Pagamentos</strong> (área do cliente) podem ser usados na página do Mercado Pago.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Cupom de desconto"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <Button variant="secondary" onClick={() => { setAppliedCoupon(null); setCouponInput(""); }}>
                    Remover
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={handleApplyCoupon}>Aplicar</Button>
                )}
              </div>
              {appliedCoupon && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Cupom {appliedCoupon.code} aplicado (−{discount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                </p>
              )}
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
                <Button onClick={() => setStep(4)}>Revisar</Button>
              </div>
            </section>
          )}
          {step === 4 && (
            <section className="space-y-3">
              <h4 className="text-sm font-medium">Revisão</h4>
              <ul className="divide-y rounded-md border text-sm max-h-40 overflow-y-auto">
                {state.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between p-3">
                    <span className="truncate pr-2">{i.name} × {i.qty}</span>
                    <span>{(i.price * i.qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </li>
                ))}
              </ul>
              <div className="text-sm text-muted-foreground">Subtotal {subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
              <div className="text-sm text-muted-foreground">Frete {shipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
              {discount > 0 && (
                <div className="text-sm text-muted-foreground">Desconto −{discount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
              )}
              <div className="font-semibold">Total {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(3)}>Voltar</Button>
                <DialogClose asChild>
                  <Button
                    disabled={isSubmitting}
                    onClick={async () => {
                      try {
                        setIsSubmitting(true);
                        const checkout = await createOrderCheckout({
                          items: state.items.map((i) => ({ productId: i.id, quantity: i.qty })),
                          shipping: { addressLine: addressLineForApi, city: city.trim(), state: uf.trim() },
                          couponCode: appliedCoupon?.code ?? null,
                        });
                        dispatch({ type: "clear" });
                        notify({ title: "Checkout criado", description: "Redirecionando para pagamento…", variant: "success" });
                        window.location.href = checkout.checkoutUrl;
                      } catch (err: unknown) {
                        notify({ title: "Falha no checkout", description: parseCheckoutError(err), variant: "error" });
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  >
                    Confirmar
                  </Button>
                </DialogClose>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
