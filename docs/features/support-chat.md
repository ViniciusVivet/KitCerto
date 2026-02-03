# Suporte: ticket + chat com a loja do produto

> **Status:** Fase 1 e fase 2 implementadas: ticket com pedido, chat, SellerId no ticket, notificação (stub), área Chamados no dashboard (admin + seller), seller pode listar e responder chamados da sua loja.

## Objetivo

Quando o cliente abrir um chamado de suporte:
1. **Vincular ao pedido** – escolher um pedido; o backend deriva o **SellerId** do produto e atribui o ticket à loja.
2. **Abrir um chat** – troca de mensagens em thread (cliente ↔ loja/suporte).
3. **Enviar para a loja certa** – ticket com `SellerId`; a loja é notificada (e-mail em stub) e responde pelo Dashboard → Chamados.

---

## O que já foi implementado (fase 1)

- **Ticket com pedido**: ao abrir chamado, opção “Relacionado a um pedido” (dropdown com meus pedidos). O backend guarda `orderId` no ticket.
- **Chat (thread de mensagens)**:
  - Entidade `TicketMessage` (TicketId, SenderUserId, Message, CreatedAtUtc).
  - API: `GET /tickets/:id/messages`, `POST /tickets/:id/messages`.
  - Na tela de suporte: ao clicar em um chamado, abre o “chat” com a mensagem inicial + thread de mensagens e campo para enviar nova mensagem.
- **Resposta do suporte**: admin pode responder pelo backend (endpoint que adiciona mensagem com `senderUserId` do admin ou “support”).

---

## Fase 2 (implementada)

- **Entidade Seller** e **Product.SellerId**, **SupportTicket.SellerId**.
- Ao criar ticket com pedido, o backend preenche `SellerId` a partir do produto.
- **Notificação da loja:** serviço `INotifySellerService` (implementação atual: log; em produção pode ser e-mail real).
- **Dashboard → Chamados:** admin vê todos os tickets; seller vê só os da sua loja e pode responder (`GET /tickets/for-seller`, `POST /tickets/:id/messages`).

### Pendente / opcional

- **E-mail real** para o seller quando o cliente envia mensagem (substituir o stub por SMTP ou provedor).
