"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listOrders, type Order } from "@/services/orders";
import {
  listPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  type PaymentMethod,
} from "@/services/paymentMethods";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { CreditCard, History, Receipt, ExternalLink, Trash2, Plus } from "lucide-react";
import { useToast } from "@/context/toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    processing: "Processando",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    pending_payment: "Aguardando pagamento",
  };
  return map[s] ?? s;
}

function brandLabel(brand: string): string {
  const map: Record<string, string> = {
    visa: "Visa",
    master: "Mastercard",
    amex: "Amex",
    elo: "Elo",
    hipercard: "Hipercard",
  };
  return map[brand?.toLowerCase() ?? ""] ?? brand ?? "Cartão";
}

export default function PagamentosPage() {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [tokenInput, setTokenInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<PaymentMethod | null>(null);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => listOrders(),
  });

  const { data: methods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => listPaymentMethods(),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      setCardToRemove(null);
      notify({ title: "Cartão removido", variant: "success" });
    },
    onError: (err: Error) => {
      notify({ title: "Erro ao remover", description: err.message, variant: "error" });
    },
  });

  function handleConfirmRemove(m: PaymentMethod) {
    setCardToRemove(m);
  }

  function handleRemoveCard() {
    if (!cardToRemove) return;
    deleteMutation.mutate(cardToRemove.id);
  }

  async function handleAddCard() {
    const token = tokenInput.trim();
    if (!token) {
      notify({ title: "Informe o token", description: "O token é gerado pelo Mercado Pago (formulário seguro).", variant: "error" });
      return;
    }
    setAdding(true);
    try {
      await addPaymentMethod({ token });
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      setTokenInput("");
      notify({ title: "Cartão adicionado", variant: "success" });
    } catch (err: any) {
      notify({ title: "Erro ao adicionar cartão", description: err?.message ?? "Tente novamente.", variant: "error" });
    } finally {
      setAdding(false);
    }
  }

  const isLoading = ordersLoading || methodsLoading;

  if (isLoading) {
    return (
      <>
        <section className="mb-6">
          <h1 className="text-2xl font-semibold">Pagamentos</h1>
          <p className="text-sm text-muted-foreground">Formas de pagamento salvas e histórico.</p>
        </section>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 rounded bg-muted" />
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">Pagamentos</h1>
        <p className="text-sm text-muted-foreground">Histórico de pagamentos e métodos salvos.</p>
      </section>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" /> Métodos salvos
          </CardTitle>
          <CardDescription>
            Cartões cadastrados para uso no checkout. O pagamento no site é feito via Mercado Pago (cartão ou PIX).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {methods.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cartão salvo.</p>
          ) : (
            <ul className="space-y-2">
              {methods.map((m: PaymentMethod) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium">
                        {brandLabel(m.brand)} •••• {m.last4}
                        {m.isDefault && (
                          <span className="ml-2 text-xs text-muted-foreground">(padrão)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(m.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="rounded-lg border border-dashed p-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Adicionar cartão
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Em produção, o formulário seguro do Mercado Pago gera um token aqui. Para testes, use um token válido do MP se disponível.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Token do cartão (Mercado Pago)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleAddCard} disabled={adding}>
                {adding ? "Salvando…" : "Adicionar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!cardToRemove} onOpenChange={(open) => !open && setCardToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover cartão?</DialogTitle>
            <DialogDescription>
              {cardToRemove
                ? `O cartão ${brandLabel(cardToRemove.brand)} •••• ${cardToRemove.last4} será removido. Você poderá adicioná-lo novamente depois.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="secondary" onClick={() => setCardToRemove(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveCard}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo…" : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" /> Histórico de pagamentos
          </CardTitle>
          <CardDescription>Pagamentos realizados nos seus pedidos.</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Nenhum pagamento ainda.</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/" className="inline-flex items-center gap-2">
                  Fazer minha primeira compra
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((o: Order) => (
                <li key={o.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium">Pedido {o.id}</p>
                      <p className="text-muted-foreground">
                        {new Date(o.createdAtUtc).toLocaleDateString("pt-BR")} · {statusLabel(o.status)}
                      </p>
                      <Link
                        href="/meus-pedidos"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Ver em Meus pedidos <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                  <span className="font-semibold shrink-0">
                    {o.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
