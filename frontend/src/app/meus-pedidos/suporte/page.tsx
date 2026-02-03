"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMyTickets,
  createTicket,
  listTicketMessages,
  addTicketMessage,
  type Ticket,
  type TicketMessage as TicketMessageType,
} from "@/services/tickets";
import { listOrders } from "@/services/orders";
import { getSettings } from "@/services/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast";
import { useAuth } from "@/context/auth";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LifeBuoy, MessageCircle, Plus, Send, Mail, Phone, X } from "lucide-react";

const FAQ_ITEMS = [
  { q: "Como rastrear meu pedido?", a: "Após a confirmação do pagamento, você receberá um e-mail com o código de rastreio. Também pode ver o status em Meus pedidos." },
  { q: "Posso trocar ou devolver?", a: "Sim. Entre em contato pelo Suporte em até 7 dias após o recebimento. Abra um chamado informando o número do pedido e o motivo." },
  { q: "Quais formas de pagamento?", a: "Aceitamos cartão de crédito e débito e PIX via Mercado Pago no checkout." },
  { q: "Como alterar meu endereço de entrega?", a: "Em Meus pedidos → Endereços você pode adicionar, editar ou definir o endereço principal." },
];

function statusLabel(s: string): string {
  const map: Record<string, string> = { open: "Aberto", in_progress: "Em atendimento", closed: "Encerrado" };
  return map[s] ?? s;
}

export default function SuportePage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<string>("");
  const [chatTicket, setChatTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => listMyTickets(),
  });
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => getSettings(),
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => listOrders(),
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["ticket-messages", chatTicket?.id],
    queryFn: () => listTicketMessages(chatTicket!.id),
    enabled: !!chatTicket?.id,
  });

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setModalOpen(false);
      setSubject("");
      setMessage("");
      setOrderId("");
      notify({ title: "Chamado aberto", description: "Em breve nossa equipe entrará em contato.", variant: "success" });
    },
    onError: (e: Error) => notify({ title: "Erro", description: e.message, variant: "error" }),
  });

  const addMessageMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      addTicketMessage(ticketId, { message }),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      setNewMessage("");
    },
    onError: (e: Error) => notify({ title: "Erro ao enviar", description: e.message, variant: "error" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      notify({ title: "Preencha assunto e mensagem", variant: "error" });
      return;
    }
    createMutation.mutate({
      subject: subject.trim(),
      message: message.trim(),
      orderId: orderId.trim() || undefined,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatTicket || !newMessage.trim()) return;
    addMessageMutation.mutate({ ticketId: chatTicket.id, message: newMessage.trim() });
  };

  const isFromMe = (senderUserId: string) => user?.id === senderUserId;

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">Suporte</h1>
        <p className="text-sm text-muted-foreground">Dúvidas, trocas e contato com a equipe. Você pode vincular o chamado a um pedido e acompanhar as respostas no chat.</p>
      </section>

      {(settings?.supportEmail || settings?.supportPhone) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">Contato da loja</CardTitle>
            <CardDescription>Use um dos canais abaixo para falar com a equipe.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm">
            {settings.supportEmail && (
              <a href={`mailto:${settings.supportEmail}`} className="flex items-center gap-2 text-primary hover:underline">
                <Mail className="h-4 w-4" /> {settings.supportEmail}
              </a>
            )}
            {settings.supportPhone && (
              <a href={`tel:${settings.supportPhone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-primary hover:underline">
                <Phone className="h-4 w-4" /> {settings.supportPhone}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LifeBuoy className="h-4 w-4" /> Perguntas frequentes
          </CardTitle>
          <CardDescription>Respostas rápidas para as dúvidas mais comuns.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {FAQ_ITEMS.map((faq, i) => (
              <li key={i} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <p className="font-medium text-sm">{faq.q}</p>
                <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4" /> Meus chamados
            </CardTitle>
            <CardDescription>Abra um chamado e acompanhe as respostas no chat. Opcionalmente, vincule a um pedido.</CardDescription>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Abrir chamado
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-24 rounded bg-muted animate-pulse" />
          ) : tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum chamado aberto. Clique em &quot;Abrir chamado&quot; para falar com a equipe.</p>
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

      {/* Modal: Abrir chamado */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Abrir chamado</DialogTitle>
            <DialogDescription>Descreva sua dúvida ou problema. Opcionalmente, vincule a um pedido para a equipe localizar melhor.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Relacionado a um pedido (opcional)</label>
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Nenhum</option>
                {orders.map((o: { id: string }) => (
                  <option key={o.id} value={o.id}>Pedido {o.id}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assunto</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex.: Dúvida sobre entrega" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva seu problema ou dúvida..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                <Send className="h-4 w-4" /> {createMutation.isPending ? "Enviando…" : "Enviar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              {/* Mensagem inicial do ticket */}
              {chatTicket && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm">
                    <p className="text-xs font-medium opacity-90 mb-0.5">Você</p>
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
                        {isFromMe(m.senderUserId) ? "Você" : "Suporte"}
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
                placeholder="Digite sua mensagem..."
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
    </>
  );
}
