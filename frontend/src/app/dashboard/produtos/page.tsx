"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProducts, listCategories, createProduct, updateProduct, deleteProduct } from "@/services/products";
import { uploadMedia } from "@/services/media";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMemo, useState, useEffect } from "react";
import { useToast } from "@/context/toast";
import { Plus, X, GripVertical, Search, Package, Image as ImageIcon, Film, UploadCloud, Edit as EditIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";

type CombinedMedia = {
  id: string;
  url: string;
  type: "image" | "video";
  file?: File;
  isExisting: boolean;
};

export default function AdminProdutosPage() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get("categoryId") || "";
  
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState(initialCategoryId);
  const [editing, setEditing] = useState<any | null>(null);
  const [mediaItems, setMediaItems] = useState<CombinedMedia[]>([]);
  
  const { notify } = useToast();
  
  // Queries
  const { data: productsRaw, isLoading: isLoadingProducts } = useQuery({ 
    queryKey: ["prod", q, catFilter], 
    queryFn: () => listProducts({ name: q, categoryId: catFilter }, true) 
  });
  
  const { data: categoriesRaw, isLoading: isLoadingCats } = useQuery({ 
    queryKey: ["cats"], 
    queryFn: () => listCategories(undefined, true) 
  });

  const products = useMemo(() => {
    if (productsRaw && (productsRaw as any).items) return (productsRaw as any).items as any[];
    if (Array.isArray(productsRaw)) return productsRaw;
    return [];
  }, [productsRaw]);

  const categories = useMemo(() => Array.isArray(categoriesRaw) ? categoriesRaw : [], [categoriesRaw]);

  // Cleanup de URLs
  useEffect(() => {
    return () => {
      mediaItems.forEach(item => {
        if (item.file) URL.revokeObjectURL(item.url);
      });
    };
  }, [mediaItems]);

  const handleAddFiles = (files: File[]) => {
    const newItems: CombinedMedia[] = [];
    files.forEach(file => {
      const type = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
      if (!type) return;
      newItems.push({
        id: `new-${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        type: type as any,
        file,
        isExisting: false
      });
    });
    setMediaItems(prev => [...prev, ...newItems]);
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems(prev => {
      const item = prev.find(m => m.id === id);
      if (item?.file) URL.revokeObjectURL(item.url);
      return prev.filter(m => m.id !== id);
    });
  };

  const handleReorderMedia = (draggedId: string, targetId: string) => {
    setMediaItems(prev => {
      const items = [...prev];
      const dIdx = items.findIndex(m => m.id === draggedId);
      const tIdx = items.findIndex(m => m.id === targetId);
      if (dIdx === -1 || tIdx === -1) return prev;
      const [moved] = items.splice(dIdx, 1);
      items.splice(tIdx, 0, moved);
      return items;
    });
  };

  async function getPayloadWithMedia(fd: FormData, currentMedia: CombinedMedia[]) {
    // 1. Upload de mídias novas
    const toUpload = currentMedia.filter(m => !m.isExisting && m.file).map(m => m.file!);
    let uploaded: any[] = [];
    if (toUpload.length > 0) {
      uploaded = await uploadMedia(toUpload);
    }

    // 2. Montar lista final unificada (lidando com url/Url e type/Type do banco)
    let upIdx = 0;
    const finalMedia = currentMedia.map(m => {
      if (m.isExisting) return { url: m.url, type: m.type };
      const res = uploaded[upIdx++];
      return { url: res.url || res.Url, type: res.type || res.Type };
    });

    const stockValue = Number(fd.get("stock") || 0);
    const descValue = fd.get("description") as string;

    return {
      name: fd.get("name") as string,
      description: descValue || "Sem descrição", // Evita o erro 400 de campo obrigatório
      price: Number(fd.get("price")),
      categoryId: fd.get("categoryId") as string,
      stock: stockValue,
      quantity: stockValue, 
      media: finalMedia,
    };
  }

  const createMut = useMutation({
    mutationFn: async (fd: FormData) => {
      const payload = await getPayloadWithMedia(fd, mediaItems);
      return createProduct(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prod"] });
      notify({ title: "Sucesso!", description: "Produto criado com mídias.", variant: "success" });
      setMediaItems([]);
    },
    onError: (err: any) => notify({ title: "Erro", description: err.message, variant: "error" })
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, fd }: { id: string; fd: FormData }) => {
      const payload = await getPayloadWithMedia(fd, mediaItems);
      return updateProduct(id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prod"] });
      notify({ title: "Sucesso!", description: "Produto atualizado com sucesso.", variant: "success" });
      setEditing(null);
      setMediaItems([]);
    },
    onError: (err: any) => notify({ title: "Erro ao salvar", description: err.message, variant: "error" })
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir definitivamente este produto?")) return;
    try {
      await deleteProduct(id);
      qc.invalidateQueries({ queryKey: ["prod"] });
      notify({ title: "Excluído", variant: "success" });
    } catch (err: any) {
      notify({ title: "Erro ao excluir", description: err.message, variant: "error" });
    }
  };

  if (isLoadingCats && categories.length === 0) {
    return <div className="p-8 space-y-4"><Skeleton className="h-12 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <section className="space-y-6">
        <h1 className="text-2xl font-bold">Gestão de Catálogo</h1>

        <Card className="p-6 border-border bg-card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Novo Produto</h2>
          <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(new FormData(e.currentTarget)); e.currentTarget.reset(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" placeholder="Nome do Produto" required />
              <Input name="description" placeholder="Descrição (Obrigatória)" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="price" type="number" step="0.01" placeholder="Preço" required />
              <select name="categoryId" className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary" required>
                <option value="">Selecionar Categoria</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Input name="stock" type="number" placeholder="Estoque" defaultValue="0" />
            </div>
            <div className="p-4 border rounded-xl bg-muted/20">
              <label className="text-xs font-bold uppercase mb-3 block text-muted-foreground flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Mídias do Produto</label>
              <MediaManager items={mediaItems} onAddFiles={handleAddFiles} onRemove={handleRemoveMedia} onReorder={handleReorderMedia} />
            </div>
            <Button type="submit" disabled={createMut.isPending}>{createMut.isPending ? "Salvando..." : "Criar Produto"}</Button>
          </form>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b font-medium">
                <tr>
                  <th className="p-4 text-left">Preview</th>
                  <th className="p-4 text-left">Nome</th>
                  <th className="p-4 text-left">Preço</th>
                  <th className="p-4 text-center">Estoque</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">Catálogo vazio.</td></tr>
                ) : products.map((p: any) => (
                  <tr key={p.id} className="border-b hover:bg-muted/20 transition-colors group">
                    <td className="p-3">
                      <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center overflow-hidden">
                        {p.media?.[0]?.url ? <img src={p.media[0].url} className="h-full w-full object-cover" /> : <ImageIcon className="opacity-20 h-5 w-5" />}
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3 font-mono">{Number(p.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="p-3 text-center">{p.stock}</td>
                    <td className="p-3 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditing(p);
                        setMediaItems((p.media ?? []).map((m: any) => ({ 
                          id: `ex-${Math.random()}`, 
                          url: m.url || m.Url, 
                          type: m.type || m.Type, 
                          isExisting: true 
                        })));
                      }}>Editar</Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {editing && (
          <EditProductDialog
            open={!!editing}
            onOpenChange={(v: boolean) => { if(!v) { setEditing(null); setMediaItems([]); } }}
            product={editing}
            categories={categories}
            mediaItems={mediaItems}
            onAddFiles={handleAddFiles}
            onRemove={handleRemoveMedia}
            onReorder={handleReorderMedia}
            onSubmit={(e: any) => {
              e.preventDefault();
              updateMut.mutate({ id: editing.id, fd: new FormData(e.currentTarget) });
            }}
            isPending={updateMut.isPending}
          />
        )}
      </section>
    </ProtectedRoute>
  );
}

function MediaManager({ items, onAddFiles, onRemove, onReorder }: any) {
  const [dragged, setDragged] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 min-h-[100px]">
      {items.map((m: any, idx: number) => (
        <div key={m.id} draggable onDragStart={() => setDragged(m.id)} onDragOver={e => e.preventDefault()} onDrop={() => { if(dragged) onReorder(dragged, m.id); setDragged(null); }} className={`relative aspect-square rounded-lg border bg-black overflow-hidden cursor-move transition-all ${dragged === m.id ? 'opacity-30' : 'hover:border-primary'}`}>
          {m.type === "video" ? <video src={m.url} className="h-full w-full object-cover" /> : <img src={m.url} className="h-full w-full object-cover" />}
          {idx === 0 && <span className="absolute top-1 left-1 bg-primary text-[8px] text-white px-1.5 py-0.5 rounded-full font-black shadow-md uppercase">Capa</span>}
          <button type="button" onClick={() => onRemove(m.id)} className="absolute top-1 right-1 bg-destructive p-1 rounded-full hover:scale-110 transition-transform shadow-md"><X className="h-3 w-3 text-white" /></button>
          <div className="absolute bottom-1 right-1 bg-black/40 p-0.5 rounded backdrop-blur-sm"><GripVertical className="h-3 w-3 text-white" /></div>
        </div>
      ))}
      <label className="aspect-square border-2 border-dashed flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all group">
        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-[10px] uppercase font-bold text-muted-foreground group-hover:text-primary transition-colors">Add</span>
        <input type="file" multiple className="hidden" accept="image/*,video/*" onChange={e => onAddFiles(Array.from(e.target.files ?? []))} />
      </label>
    </div>
  );
}

function EditProductDialog({ open, onOpenChange, product, categories, mediaItems, onAddFiles, onRemove, onReorder, onSubmit, isPending }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><EditIcon className="h-5 w-5 text-primary" /> Editando: {product.name}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Nome</label><Input name="name" defaultValue={product?.name} required /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Descrição</label><Input name="description" defaultValue={product?.description} required /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Preço (R$)</label><Input name="price" type="number" step="0.01" defaultValue={product?.price} required /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Estoque</label><Input name="stock" type="number" defaultValue={product?.stock} /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <select name="categoryId" defaultValue={product?.categoryId} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary" required>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="p-4 border rounded-xl bg-muted/20">
            <label className="text-xs font-bold uppercase mb-3 block text-muted-foreground flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Gerenciar Mídias</label>
            <MediaManager items={mediaItems} onAddFiles={onAddFiles} onRemove={onRemove} onReorder={onReorder} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending} className="min-w-[150px]">{isPending ? "Salvando..." : "Salvar Alterações"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
