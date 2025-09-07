"use client";

import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createSellerRequest, listSellerRequests } from "@/services/sellers";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function QueroVenderPage() {
  const { isAuthenticated, user, login } = useAuth();
  const { notify } = useToast();

  const { data: existing } = useQuery({
    queryKey: ["seller-requests"],
    queryFn: () => listSellerRequests(),
    enabled: isAuthenticated,
  });

  const mut = useMutation({
    mutationFn: (payload: any) => createSellerRequest(payload),
    onSuccess: () => notify({ title: "Solicitação enviada", variant: "success" }),
    onError: () => notify({ title: "Falha ao enviar solicitação", variant: "error" }),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isAuthenticated || !user) return login();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      userId: user.id,
      email: user.email,
      storeName: String(fd.get("storeName") || ""),
      phone: String(fd.get("phone") || ""),
      description: String(fd.get("description") || ""),
    });
    e.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-[42rem] px-4 py-6 sm:px-5 lg:px-7">
      <h1 className="mb-2 text-2xl font-semibold">Quero vender</h1>
      <p className="mb-6 text-sm text-muted-foreground">Solicite acesso para gerenciar catálogo, estoque e pedidos.</p>

      {!isAuthenticated && (
        <Card className="mb-6 p-4">
          <p className="mb-3 text-sm">Você precisa estar logado para solicitar.</p>
          <Button onClick={login}>Entrar</Button>
        </Card>
      )}

      <Card className="p-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome da loja</label>
            <Input name="storeName" placeholder="Ex.: Loja Neon" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Telefone/WhatsApp</label>
            <Input name="phone" placeholder="(11) 99999-9999" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Descrição</label>
            <Input name="description" placeholder="Breve descrição do negócio" />
          </div>
          <Button type="submit" disabled={!isAuthenticated || mut.isPending}>Enviar solicitação</Button>
        </form>
      </Card>

      {Array.isArray(existing) && existing.length > 0 && (
        <Card className="mt-6 p-4 text-sm">
          <div className="mb-2 font-medium">Suas solicitações</div>
          <ul className="list-disc pl-5">
            {existing.map((s: any) => (
              <li key={s.id}>{s.storeName} — <span className="uppercase">{s.status}</span></li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}


