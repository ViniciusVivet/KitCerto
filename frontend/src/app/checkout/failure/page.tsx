"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAILURE_REASONS: Record<string, string> = {
  cc_rejected_insufficient_amount: "Saldo insuficiente no cartão.",
  cc_rejected_bad_filled_card_number: "Número do cartão incorreto.",
  cc_rejected_bad_filled_date: "Data de validade incorreta.",
  cc_rejected_bad_filled_security_code: "CVV incorreto.",
  cc_rejected_blacklist: "Cartão recusado. Entre em contato com seu banco.",
  cc_rejected_call_for_authorize: "Autorização necessária — ligue para seu banco.",
  cc_rejected_duplicated_payment: "Pagamento duplicado detectado.",
  cc_rejected_high_risk: "Pagamento recusado por análise de risco.",
  rejected: "Pagamento recusado.",
};

function FailureContent() {
  const params = useSearchParams();

  const orderId = params.get("external_reference") ?? null;
  const statusDetail = params.get("status_detail") ?? params.get("collection_status") ?? null;
  const reason = statusDetail ? (FAILURE_REASONS[statusDetail] ?? FAILURE_REASONS["rejected"]) : FAILURE_REASONS["rejected"];

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Ícone */}
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 ring-4 ring-red-500/20">
            <XCircle className="h-14 w-14 text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Pagamento recusado</h1>
          <p className="text-muted-foreground">{reason}</p>
        </div>

        {orderId && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm">
            <p className="text-muted-foreground">
              Pedido: <span className="font-mono font-semibold text-foreground">{orderId}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              O pedido foi registrado. Tente pagar novamente em <strong>Meus Pedidos</strong>.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <RotateCcw className="h-4 w-4" />
              Tentar novamente
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="gap-2">
            <Link href="/meus-pedidos">
              <ArrowLeft className="h-4 w-4" />
              Meus pedidos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailurePage() {
  return (
    <Suspense>
      <FailureContent />
    </Suspense>
  );
}
