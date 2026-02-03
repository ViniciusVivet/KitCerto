"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAllTickets,
  listTicketsForSeller,
  listTicketMessages,
  addTicketMessage,
  type Ticket,
  type TicketMessage as TicketMessageType,
} from "@/services/tickets";
import { getMySeller } from "@/services/sellers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast";
import { useAuth } from "@/context/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, Send, X } from "lucide-react";

function statusLabel(s: string): string {
  const map: Record<string, string> = { open: "Aberto", in_progress: "Em atendimento", closed: "Encerrado" };
  return map[s] ?? s;
}

export default function DashboardChamadosPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { user, isAdmin } = useAuth();
  const [chatTicket, setChatTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ["sellers", "me"],
    queryFn: getMySeller,
  });
  const isSeller = !!seller;
  const isAdminUser = isAdmin();
  const canAccess = isAdminUser || isSeller;

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["dashboard-tickets", isAdminUser ? "all" : "seller"],
    queryFn: isAdminUser ? listAllTickets : listTicketsForSeller,
    enabled: canAccess,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["ticket-messages", chatTicket?.id],
    queryFn: () => listTicketMessages(chatTicket!.id),
    enabled: !!chatTicket?.id,
  });

  const addMessageMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      addTicketMessage(ticketId, { message }),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-tickets"] });
      setNewMessage("");
    },
    onError: (e: Error) => notify({ title: "Erro ao enviar", description: e.message, variant: "error" }),
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatTicket || !newMessage.trim()) return;
    addMessageMutation.mutate({ ticketId: chatTicket.id, message: newMessage.trim() });
  };

  const isFromMe = (senderUserId: string) => user?.id === senderUserId;

  const accessDenied = !sellerLoading && !canAccess;
  const loading = sellerLoading;

  return (
    <ProtectedRoute
      unauthTitle="Acesso restrito"
      unauthMessage="Faça login para acessar os chamados."
    >
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-5 lg:px-7">
        {loading && (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {accessDenied && (
          <Card>
            <CardHeader>
              <CardTitle>Acesso negado</CardTitle>
              <CardDescription>
                Esta área é apenas para administradores da plataforma ou para lojas (vendedores) credenciadas.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!loading && canAccess && (
          <>
            <section className="mb-6">
              <h1 className="text-2xl font-semibold">Chamados</h1>
              <p className="text-sm text-muted-foreground">
                {isAdminUser
                  ? "Todos os chamados da plataforma. Clique em um chamado para ver o chat e responder."
                  : "Chamados da sua loja. Responda aos clientes pelo chat."}
              </p>
            </section>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-4 w-4" /> Lista de chamados
                </CardTitle>
                <CardDescription>
                  {isAdminUser ? "Chamados de todos os clientes." : "Chamados em que sua loja foi atribuída."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="h-32 rounded bg-muted animate-pulse" />
                ) : tickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6">
                    Nenhum chamado no momento.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {tickets.map((t: Ticket) => (
                      <li key={t.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{t.subject}</p>
                          <span className="rounded bg-muted px-2 py-0.5 text-xs">{statusLabel(t.status)}</span>
                        </div>
                        {t.orderId && (
                          <p className="text-xs text-muted-foreground mt-0.5">Pedido: {t.orderId}</p>
                        )}
                        <p className="text-muted-foreground mt-1 line-clamp-2">{t.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(t.createdAtUtc).toLocaleString("pt-BR")}</p>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-2 gap-1"
                          onClick={() => setChatTicket(t)}
                        >
                          <MessageCircle className="h-3 w-3" /> Abrir chat
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Modal: Chat do chamado */}
      <Dialog open={!!chatTicket} onOpenChange={(open) => !open && setChatTicket(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2">
              <span>{chatTicket?.subject}</span>
              <Button variant="ghost" size="icon" onClick={() => setChatTicket(null)} aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            {chatTicket?.orderId && (
              <DialogDescription>Pedido: {chatTicket.orderId}</DialogDescription>
            )}
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex-1 overflow-y-auto space-y-3 rounded-md border p-3 bg-muted/30 min-h-[200px]">
              {/* Mensagem inicial do ticket (cliente) */}
              {chatTicket && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg bg-muted border px-3 py-2 text-sm">
                    <p className="text-xs font-medium opacity-90 mb-0.5">Cliente</p>
                    <p>{chatTicket.message}</p>
                    <p className="text-xs opacity-75 mt-1">{new Date(chatTicket.createdAtUtc).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              )}
              {messagesLoading ? (
                <div className="text-sm text-muted-foreground">Carregando mensagens…</div>
              ) : (
                messages.map((m: TicketMessageType) => (
                  <div
                    key={m.id}
                    className={isFromMe(m.senderUserId) ? "flex justify-end" : "flex justify-start"}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        isFromMe(m.senderUserId)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted border"
                      }`}
                    >
                      <p className="text-xs font-medium opacity-90 mb-0.5">
                        {isFromMe(m.senderUserId) ? "Você" : "Cliente"}
                      </p>
                      <p>{m.message}</p>
                      <p className="text-xs opacity-75 mt-1">{new Date(m.createdAtUtc).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua resposta..."
                className="flex-1"
                disabled={addMessageMutation.isPending}
              />
              <Button type="submit" disabled={!newMessage.trim() || addMessageMutation.isPending} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
