"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, type StoreSettings } from "@/services/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast";
import { Settings, Store, Shield, Bell, Truck, Save, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ConfiguracoesPage() {
  const qc = useQueryClient();
  const { notify } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: () => getSettings()
  });

  const mutation = useMutation({
    mutationFn: (newSettings: StoreSettings) => updateSettings(newSettings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-settings"] });
      notify({ title: "Configurações salvas!", variant: "success" });
    },
    onError: () => notify({ title: "Erro ao salvar", variant: "error" })
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: StoreSettings = {
      storeName: fd.get("storeName") as string,
      supportEmail: fd.get("supportEmail") as string,
      supportPhone: fd.get("supportPhone") as string,
      freeShippingThreshold: Number(fd.get("freeShippingThreshold")),
      promoBannerActive: fd.get("promoBannerActive") === "on",
      promoBannerText: fd.get("promoBannerText") as string,
      maintenanceMode: fd.get("maintenanceMode") === "on",
    };
    mutation.mutate(payload);
  };

  if (isLoading) return <div className="p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;

  return (
    <ProtectedRoute requiredRole="admin">
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Configurações do Sistema</h1>
          <p className="text-sm text-muted-foreground">Controle a identidade da loja, regras de frete e avisos globais.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  <CardTitle>Identidade da Loja</CardTitle>
                </div>
                <CardDescription>Informações básicas que aparecem para o cliente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Nome da Loja</label>
                  <Input name="storeName" defaultValue={settings?.storeName} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">E-mail de Suporte</label>
                  <Input name="supportEmail" type="email" defaultValue={settings?.supportEmail} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">WhatsApp/Telefone</label>
                  <Input name="supportPhone" defaultValue={settings?.supportPhone} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <CardTitle>Regras de Entrega</CardTitle>
                </div>
                <CardDescription>Configure limites de frete e logística.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Mínimo para Frete Grátis (R$)</label>
                  <Input name="freeShippingThreshold" type="number" step="0.01" defaultValue={settings?.freeShippingThreshold} />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" name="maintenanceMode" defaultChecked={settings?.maintenanceMode} className="rounded border-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Modo Manutenção</span>
                    <span className="text-xs text-muted-foreground">Bloqueia o checkout para os clientes.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Banner Promocional</CardTitle>
                </div>
                <CardDescription>Aviso que aparece no topo de todas as páginas da loja.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Texto do Banner</label>
                  <Input name="promoBannerText" defaultValue={settings?.promoBannerText} placeholder="Ex: Cupom BEMVINDO com 10% OFF!" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="promoBannerActive" defaultChecked={settings?.promoBannerActive} className="rounded border-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Ativo</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end sticky bottom-4">
            <Button type="submit" size="lg" className="gap-2 shadow-xl shadow-primary/20" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
              {mutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </section>
    </ProtectedRoute>
  );
}
