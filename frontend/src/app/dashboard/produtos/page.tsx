"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProducts, listCategories, createProduct, updateProduct, deleteProduct } from "@/services/products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/context/toast";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ProdutosPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const { data: products = { items: [], total: 0 } } = useQuery({ queryKey: ["prod", q], queryFn: () => listProducts({ name: q }) });
  const { data: categories = [] } = useQuery({ queryKey: ["cats"], queryFn: () => listCategories() });

  const createMut = useMutation({
    mutationFn: (payload: any) => createProduct(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prod"] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateProduct(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prod"] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prod"] }),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      price: Number(fd.get("price")),
      categoryId: fd.get("categoryId") as string,
      quantity: Number(fd.get("quantity")),
      stock: Number(fd.get("stock")),
    };
    if (editing?.id) {
      updateMut.mutate(
        { id: editing.id, payload },
        { onSuccess: () => notify({ title: "Editado com sucesso", variant: "success" }), onError: () => notify({ title: "Falha ao editar", variant: "error" }) }
      );
    } else {
      createMut.mutate(payload, { onSuccess: () => notify({ title: "Criado com sucesso", variant: "success" }), onError: () => notify({ title: "Falha ao criar", variant: "error" }) });
    }
    setEditing(null);
    e.currentTarget.reset();
  }

  const { notify } = useToast();

  return (
    <ProtectedRoute requiredRole="admin">
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-sm text-muted-foreground">Criar, editar, visualizar e excluir.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Input name="name" placeholder="Nome do produto" required className="w-48 pr-6" />
            <span title="Obrigatório. 3–80 caracteres. Deve ser único.\nSugestão: Camiseta Neon KitCerto 24" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-help text-muted-foreground">i</span>
          </div>
          <div className="relative">
            <Input name="description" placeholder="Descrição (curta)" className="w-56 pr-6" />
            <span title="Opcional. Até 160 caracteres.\nAjuda no SEO e identificação." className="absolute right-2 top-1/2 -translate-y-1/2 cursor-help text-muted-foreground">i</span>
          </div>
          <div className="relative">
            <Input name="price" type="number" step="0.01" placeholder="Preço (R$)" required className="w-32 pr-6" />
            <span title="Obrigatório. Use ponto para decimais. Ex.: 149.90\nMínimo: 0.01" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-help text-muted-foreground">i</span>
          </div>
          <div className="relative">
            <select name="categoryId" className="h-10 rounded-md border bg-background px-2 pr-6">
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span title="Obrigatório. Selecione a categoria apropriada.\nUse a lista de categorias cadastradas." className="absolute -right-3 top-1/2 -translate-y-1/2 cursor-help text-muted-foreground">i</span>
          </div>
          <div className="relative">
            <Input name="quantity" type="number" placeholder="Qtd" className="w-24 pr-6" />
            <span title="Opcional. Quantidade por pacote/lote, se aplicável." className="absolute right-2 top-1/2 -translate-y-1/2 cursor-help text-muted-foreground">i</span>
          </div>
          <div className="relative">
            <Input name="stock" type="number" placeholder="Estoque" className="w-28 pr-6" />
            <span title="Opcional. Estoque inicial disponível.\nUse inteiro (ex.: 100)." className="absolute right-2 top-1/2 -translate-y-1/2 cursor-help text-muted-foreground">i</span>
          </div>
          <Button type="submit">{editing ? "Salvar" : "Criar"}</Button>
          {editing && (
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
          )}
        </form>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Input placeholder="Buscar por nome…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Nome</th>
                <th className="py-2 text-left">Categoria</th>
                <th className="py-2 text-left">Preço</th>
                <th className="py-2 text-left">Estoque</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(products.items ?? []).map((p: any) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{p.categoryName ?? p.categoryId}</td>
                  <td className="py-2">{Number(p.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="py-2">{p.stock ?? p.quantity}</td>
                  <td className="py-2 text-right space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>Editar</Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMut.mutate(p.id, { onSuccess: () => notify({ title: "Excluído com sucesso", variant: "success" }), onError: () => notify({ title: "Falha ao excluir", variant: "error" }) })}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
    </ProtectedRoute>
  );
}


