"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
  type CreateAddressPayload,
} from "@/services/addresses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";

const emptyForm: CreateAddressPayload = {
  label: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
  isDefault: false,
};

export default function EnderecosPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAddressPayload>(emptyForm);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => listAddresses(),
  });

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setModalOpen(false);
      setForm(emptyForm);
      notify({ title: "Endereço adicionado", variant: "success" });
    },
    onError: (e: Error) => notify({ title: "Erro", description: e.message, variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateAddressPayload }) => updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      notify({ title: "Endereço atualizado", variant: "success" });
    },
    onError: (e: Error) => notify({ title: "Erro", description: e.message, variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      notify({ title: "Endereço removido", variant: "success" });
    },
    onError: (e: Error) => notify({ title: "Erro", description: e.message, variant: "error" }),
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      notify({ title: "Endereço definido como principal", variant: "success" });
    },
    onError: (e: Error) => notify({ title: "Erro", description: e.message, variant: "error" }),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (a: Address) => {
    setEditingId(a.id);
    setForm({
      label: a.label ?? "",
      street: a.street,
      number: a.number,
      complement: a.complement ?? "",
      neighborhood: a.neighborhood ?? "",
      city: a.city,
      state: a.state,
      zipCode: a.zipCode,
      isDefault: a.isDefault,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      label: form.label || null,
      complement: form.complement || null,
      neighborhood: form.neighborhood || null,
      isDefault: form.isDefault ?? false,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <>
        <section className="mb-6">
          <h1 className="text-2xl font-semibold">Endereços</h1>
          <p className="text-sm text-muted-foreground">Gerencie endereços de entrega e cobrança.</p>
        </section>
        <Card className="animate-pulse"><CardContent className="p-6"><div className="h-24 rounded bg-muted" /></CardContent></Card>
      </>
    );
  }

  return (
    <>
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Endereços</h1>
          <p className="text-sm text-muted-foreground">Gerencie endereços de entrega e cobrança.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Novo endereço
        </Button>
      </section>

      {addresses.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
            <MapPin className="h-12 w-12" />
            <p>Nenhum endereço cadastrado. Adicione um para usar no checkout.</p>
            <Button onClick={openCreate}>Adicionar endereço</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id} className={a.isDefault ? "border-primary/50" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {a.label || "Endereço"}
                  {a.isDefault && <Badge>Principal</Badge>}
                </CardTitle>
                <CardDescription className="text-sm">
                  {a.street}, {a.number}
                  {a.complement ? ` – ${a.complement}` : ""}
                  <br />
                  {a.neighborhood && `${a.neighborhood} – `}
                  {a.city} / {a.state} – {a.zipCode}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-1 pt-0">
                {!a.isDefault && (
                  <Button variant="ghost" size="icon" title="Definir como principal" onClick={() => setDefaultMutation.mutate(a.id)}>
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(a)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Excluir" onClick={() => deleteMutation.mutate(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar endereço" : "Novo endereço"}</DialogTitle>
            <DialogDescription>Preencha os campos. CEP, rua, número, cidade e estado são obrigatórios.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Apelido (opcional)</label>
                <Input value={form.label ?? ""} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Casa, Trabalho…" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CEP</label>
                <Input value={form.zipCode} onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))} placeholder="00000-000" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rua</label>
              <Input value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Número</label>
                <Input value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Complemento</label>
                <Input value={form.complement ?? ""} onChange={(e) => setForm((f) => ({ ...f, complement: e.target.value }))} placeholder="Apto, bloco…" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bairro</label>
              <Input value={form.neighborhood ?? ""} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade</label>
                <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="UF" required maxLength={2} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isDefault" checked={form.isDefault ?? false} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="rounded border-input" />
              <label htmlFor="isDefault" className="text-sm font-medium">Usar como endereço principal</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">{children}</span>;
}
