"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Book, MessageCircle, FileCode, CheckCircle2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Como não temos um componente de Accordion nativo no UI, vou criar um simples aqui para a página
function SimpleAccordion({ title, children }: { title: string, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left font-medium hover:text-primary transition-colors">
        {title}
        <CheckCircle2 className={`h-4 w-4 transition-transform ${open ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
      </button>
      {open && <div className="pb-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1">{children}</div>}
    </div>
  );
}

export default function AjudaPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Central de Ajuda</h1>
          <p className="text-sm text-muted-foreground">Documentação, FAQ e suporte técnico para vendedores.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader>
              <Book className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Manual de Uso</CardTitle>
              <CardDescription>Aprenda a gerenciar produtos, estoque e mídias.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => window.open('/swagger', '_blank')}>
            <CardHeader>
              <FileCode className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>API Docs</CardTitle>
              <CardDescription>Documentação técnica para integrações externas.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle>Suporte KitCerto</CardTitle>
              <CardDescription>Fale com nossa equipe técnica diretamente.</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle>Perguntas Frequentes (FAQ)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <SimpleAccordion title="Como funciona o limite de mídias?">
              Cada produto permite até 5 imagens e 2 vídeos. A primeira mídia da lista sempre será considerada a "Capa" na loja do cliente.
            </SimpleAccordion>
            <SimpleAccordion title="Como o estoque é atualizado?">
              Você pode atualizar o estoque manualmente na aba 'Estoque' ou através da edição do produto. Quando um cliente finaliza uma compra paga via Mercado Pago, o estoque é reduzido automaticamente.
            </SimpleAccordion>
            <SimpleAccordion title="Quais arquivos são aceitos no upload?">
              Para imagens: JPG, PNG, WEBP e GIF. Para vídeos: MP4 e WEBM. O limite por arquivo é de 200MB.
            </SimpleAccordion>
            <SimpleAccordion title="O que é o modo manutenção?">
              Ao ativar nas 'Configurações', a loja continuará visível para busca, mas o botão de checkout será desativado para os clientes, ideal para balanços ou atualizações de catálogo.
            </SimpleAccordion>
          </CardContent>
        </Card>

        <div className="rounded-xl bg-primary/10 p-6 flex flex-col items-center text-center space-y-3 border border-primary/20">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-bold text-lg">Sistema Operacional</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Todos os serviços da API, Banco de Dados MongoDB e Keycloak estão respondendo normalmente.
          </p>
          <div className="flex gap-2">
            <Badge className="bg-emerald-500">API: Online</Badge>
            <Badge className="bg-emerald-500">DB: Online</Badge>
            <Badge className="bg-emerald-500">Auth: Online</Badge>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
