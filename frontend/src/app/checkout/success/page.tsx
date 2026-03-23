"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";

function SuccessContent() {
  const params = useSearchParams();
  const { dispatch } = useCart();

  const orderId = params.get("external_reference") ?? params.get("preference_id") ?? null;
  const paymentId = params.get("payment_id") ?? params.get("collection_id") ?? null;

  // Limpa o carrinho assim que o cliente retorna com sucesso
  useEffect(() => {
    dispatch({ type: "clear" });
  }, [dispatch]);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Ícone animado */}
        <div className="flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/20">
            <CheckCircle2 className="h-14 w-14 text-emerald-500" strokeWidth={1.5} />
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Pedido confirmado!</h1>
          <p className="text-muted-foreground">
            Pagamento aprovado com sucesso. Seu pedido já está sendo preparado.
          </p>
        </div>

        {(orderId || paymentId) && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm space-y-1">
            {orderId && (
              <p className="text-muted-foreground">
                Pedido: <span className="font-mono font-semibold text-foreground">{orderId}</span>
              </p>
            )}
            {paymentId && (
              <p className="text-muted-foreground">
                Pagamento: <span className="font-mono text-foreground">{paymentId}</span>
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Você pode acompanhar o status do envio na seção <strong>Meus Pedidos</strong>.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/meus-pedidos">
              <Package className="h-4 w-4" />
              Ver meus pedidos
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="gap-2">
            <Link href="/">
              Continuar comprando <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
