"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Clock, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function PendingContent() {
  const params = useSearchParams();

  const orderId = params.get("external_reference") ?? null;
  const paymentType = params.get("payment_type") ?? null;
  const isPix = paymentType === "bank_transfer";

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Ícone */}
        <div className="flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10 ring-4 ring-amber-500/20">
            <Clock className="h-14 w-14 text-amber-500" strokeWidth={1.5} />
            <span className="absolute inset-0 animate-ping rounded-full bg-amber-500/10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Pagamento pendente</h1>
          <p className="text-muted-foreground">
            {isPix
              ? "Escaneie o QR code do PIX no app do seu banco. Assim que o pagamento for confirmado seu pedido será processado automaticamente."
              : "Seu pagamento está em análise. Assim que aprovado, você receberá a confirmação e seu pedido será processado."}
          </p>
        </div>

        {orderId && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm space-y-1">
            <p className="text-muted-foreground">
              Pedido: <span className="font-mono font-semibold text-foreground">{orderId}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Acompanhe o status em <strong>Meus Pedidos</strong> — ele será atualizado automaticamente.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/meus-pedidos">
              <Package className="h-4 w-4" />
              Acompanhar pedido
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

export default function CheckoutPendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  );
}
