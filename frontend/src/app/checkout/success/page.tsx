"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { getGuestOrderStatus } from "@/services/orders";
import { useAuth } from "@/context/auth";
import { LoginButton } from "@/components/auth/LoginButton";

const STATUS_LABELS: Record<string, string> = {
  paid: "Pago",
  approved: "Aprovado",
  pending: "Aguardando pagamento",
  pending_payment: "Aguardando pagamento",
  processing: "Em processamento",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  rejected: "Recusado",
};

function SuccessContent() {
  const params = useSearchParams();
  const { dispatch } = useCart();
  const { isAuthenticated } = useAuth();

  const orderId = params.get("external_reference") ?? params.get("preference_id") ?? null;
  const paymentId = params.get("payment_id") ?? params.get("collection_id") ?? null;

  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [guestStatus, setGuestStatus] = useState<string | null>(null);
  const [pollingError, setPollingError] = useState(false);

  // Limpa o carrinho assim que o cliente retorna com sucesso
  useEffect(() => {
    dispatch({ type: "clear" });
  }, [dispatch]);

  // Lê o guestToken do localStorage
  useEffect(() => {
    if (!orderId) return;
    try {
      const raw = localStorage.getItem(`kitcerto:checkout:${orderId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.guestToken) setGuestToken(parsed.guestToken);
      }
    } catch {
      // ignore
    }
  }, [orderId]);

  // Polling de status para convidados
  useEffect(() => {
    if (!guestToken || !orderId) return;
    const TERMINAL = new Set(["paid", "approved", "delivered", "cancelled", "rejected", "charged_back"]);

    async function poll() {
      try {
        const data = await getGuestOrderStatus(orderId!, guestToken!);
        setGuestStatus(data.status);
        if (TERMINAL.has(data.status)) clearInterval(timer);
      } catch {
        setPollingError(true);
        clearInterval(timer);
      }
    }

    poll();
    const timer = setInterval(poll, 15_000);
    return () => clearInterval(timer);
  }, [guestToken, orderId]);

  const isGuest = Boolean(guestToken);

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
            {isGuest && guestStatus && (
              <p className="flex items-center justify-center gap-1.5 text-muted-foreground pt-1">
                <RefreshCw className="h-3 w-3 animate-spin text-emerald-500" />
                Status: <span className="font-semibold text-foreground">{STATUS_LABELS[guestStatus] ?? guestStatus}</span>
              </p>
            )}
            {pollingError && (
              <p className="text-xs text-muted-foreground">Não foi possível atualizar o status automaticamente.</p>
            )}
          </div>
        )}

        {/* CTA criar conta para convidados */}
        {isGuest && !isAuthenticated && (
          <div className="rounded-xl border border-white/10 bg-muted/30 p-4 text-sm space-y-3">
            <div className="flex justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Crie sua conta gratuitamente</p>
            <p className="text-xs text-muted-foreground">
              Acompanhe todos os seus pedidos, salve endereços e finalize compras mais rápido nas próximas vezes.
            </p>
            <LoginButton />
          </div>
        )}

        {!isGuest && (
          <p className="text-sm text-muted-foreground">
            Você pode acompanhar o status do envio na seção <strong>Meus Pedidos</strong>.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {!isGuest && (
            <Button asChild size="lg" className="gap-2">
              <Link href="/meus-pedidos">
                <Package className="h-4 w-4" />
                Ver meus pedidos
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant={isGuest ? "default" : "secondary"} className="gap-2">
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
