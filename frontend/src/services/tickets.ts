import { apiGet, apiPost } from "@/lib/api";

export type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  orderId?: string | null;
  sellerId?: string | null;
  createdAtUtc: string;
};

export type TicketMessage = {
  id: string;
  message: string;
  senderUserId: string;
  createdAtUtc: string;
};

export async function listMyTickets(): Promise<Ticket[]> {
  return apiGet<Ticket[]>("/tickets");
}

export async function createTicket(payload: {
  subject: string;
  message: string;
  orderId?: string | null;
}): Promise<{ id: string }> {
  return apiPost<{ id: string }>("/tickets", payload);
}

export async function listTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  return apiGet<TicketMessage[]>(`/tickets/${ticketId}/messages`);
}

export async function addTicketMessage(
  ticketId: string,
  payload: { message: string }
): Promise<TicketMessage> {
  return apiPost<TicketMessage>(`/tickets/${ticketId}/messages`, payload);
}

export async function listTicketsForSeller(): Promise<Ticket[]> {
  return apiGet<Ticket[]>(`/tickets/for-seller`);
}

export async function listAllTickets(): Promise<Ticket[]> {
  return apiGet<Ticket[]>(`/tickets/all`);
}
