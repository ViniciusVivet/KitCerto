"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe, uploadAvatar, type MeProfile, type UpdateProfilePayload } from "@/services/profile";
import { listAddresses } from "@/services/addresses";
import { apiBaseUrl } from "@/lib/config";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast";
import React, { useRef } from "react";

function avatarSrc(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http")) return avatarUrl;
  const base = apiBaseUrl.replace(/\/api\/?$/, "");
  return avatarUrl.startsWith("/") ? `${base}${avatarUrl}` : `${base}/${avatarUrl}`;
}

/** Normaliza data para ISO (yyyy-MM-dd) e valida ano razoável (1900–hoje). Retorna null se vazio/inválido. */
function normalizeBirthDate(value: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  let iso: string;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    iso = trimmed;
  } else {
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return null;
    iso = d.toISOString().slice(0, 10);
  }
  const year = parseInt(iso.slice(0, 4), 10);
  if (year < 1900 || year > new Date().getFullYear()) return null;
  return iso;
}

export default function DadosPessoaisPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile, isLoading } = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const { data: addresses = [] } = useQuery({ queryKey: ["addresses"], queryFn: () => listAddresses() });
  const mainAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [displayName, setDisplayName] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [birthDate, setBirthDate] = React.useState("");
  const [document, setDocument] = React.useState("");
  const [newsletterOptIn, setNewsletterOptIn] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setFullName(profile.fullName ?? "");
      setPhone(profile.phone ?? "");
      setAvatarUrl(profile.avatarUrl ?? null);
      setBirthDate(profile.birthDate ? profile.birthDate.slice(0, 10) : "");
      setDocument(profile.document ?? "");
      setNewsletterOptIn(profile.newsletterOptIn ?? false);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      notify({ title: "Perfil atualizado", description: "Seus dados foram salvos.", variant: "success" });
    },
    onError: (err: Error) => {
      notify({ title: "Erro ao salvar", description: err.message, variant: "error" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedBirth = normalizeBirthDate(birthDate);
    if (birthDate.trim() && !normalizedBirth) {
      notify({
        title: "Data inválida",
        description: "Use uma data de nascimento entre 1900 e o ano atual (formato dd/mm/aaaa ou use o seletor).",
        variant: "error",
      });
      return;
    }
    updateMutation.mutate({
      displayName: displayName || null,
      fullName: fullName || null,
      phone: phone || null,
      avatarUrl: avatarUrl || null,
      birthDate: normalizedBirth ?? null,
      document: document || null,
      newsletterOptIn,
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { url } = await uploadAvatar(file);
      setAvatarUrl(url);
      notify({ title: "Foto enviada", description: "Clique em Salvar para atualizar o perfil.", variant: "success" });
    } catch (err) {
      notify({ title: "Erro ao enviar foto", description: (err as Error).message, variant: "error" });
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <>
        <section className="mb-6">
          <h1 className="text-2xl font-semibold">Dados pessoais</h1>
          <p className="text-sm text-muted-foreground">Nome, e-mail, foto e preferências da conta.</p>
        </section>
        <Card className="animate-pulse">
          <CardHeader><div className="h-5 w-48 rounded bg-muted" /></CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 rounded bg-muted" />
            <div className="h-10 rounded bg-muted" />
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">Dados pessoais</h1>
        <p className="text-sm text-muted-foreground">Nome, e-mail, foto e preferências da conta.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Dados vindos do login e informações que você pode editar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-muted overflow-hidden border-2 border-border flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarSrc(avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl text-muted-foreground">?</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute -bottom-1 -right-1"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingAvatar ? "Enviando…" : "Foto"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Clique em Foto para enviar uma imagem (jpg, png, webp ou gif).</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome (conta)</label>
              <Input value={profile?.name ?? ""} disabled className="bg-muted" placeholder="Vindo do login" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail (conta)</label>
              <Input value={profile?.email ?? ""} disabled className="bg-muted" placeholder="Vindo do login" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome completo</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nome e sobrenome"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome de exibição</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como quer ser chamado"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CPF</label>
              <Input
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de nascimento</label>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="newsletter"
                checked={newsletterOptIn}
                onChange={(e) => setNewsletterOptIn(e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="newsletter" className="text-sm font-medium">Receber ofertas e novidades por e-mail</label>
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando…" : "Salvar alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Endereço principal</CardTitle>
          <CardDescription>Endereço de entrega padrão. Gerencie todos em Endereços.</CardDescription>
        </CardHeader>
        <CardContent>
          {mainAddress ? (
            <p className="text-sm text-muted-foreground">
              {mainAddress.street}, {mainAddress.number}
              {mainAddress.complement ? ` – ${mainAddress.complement}` : ""}
              <br />
              {mainAddress.neighborhood && `${mainAddress.neighborhood} – `}
              {mainAddress.city} / {mainAddress.state} – {mainAddress.zipCode}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
          )}
          <Button variant="outline" className="mt-3" asChild>
            <Link href="/meus-pedidos/enderecos">Gerenciar endereços</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
