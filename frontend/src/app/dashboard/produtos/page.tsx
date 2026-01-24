"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProducts, listCategories, createProduct, updateProduct, deleteProduct } from "@/services/products";
import { uploadMedia, type MediaItem } from "@/services/media";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMemo, useState, useEffect } from "react";
import { useToast } from "@/context/toast";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ProdutosPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]);
  const { data: products = { items: [], total: 0 } } = useQuery({ queryKey: ["prod", q], queryFn: () => listProducts({ name: q }) });
  const { data: categories = [] } = useQuery({ queryKey: ["cats"], queryFn: () => listCategories() });
  const mediaPreviews = useMemo(
    () =>
      mediaFiles.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
        name: file.name,
      })),
    [mediaFiles]
  );

  useEffect(() => {
    return () => {
      mediaPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [mediaPreviews]);

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

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    let uploaded: MediaItem[] = [];
    if (mediaFiles.length > 0) {
      try {
        uploaded = await uploadMedia(mediaFiles);
      } catch (err: any) {
        notify({ title: "Falha no upload", description: err?.message ?? "Erro inesperado", variant: "error" });
        return;
      }
    }
    const mergedMedia = [...uploaded].map((m) => ({ url: m.url, type: m.type }));
    const payload = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      price: Number(fd.get("price")),
      categoryId: fd.get("categoryId") as string,
      quantity: Number(fd.get("quantity")),
      stock: Number(fd.get("stock")),
      media: mergedMedia,
    };
    createMut.mutate(payload, { onSuccess: () => notify({ title: "Criado com sucesso", variant: "success" }), onError: () => notify({ title: "Falha ao criar", variant: "error" }) });
    setMediaFiles([]);
    setExistingMedia([]);
    e.currentTarget.reset();
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing?.id) return;
    const fd = new FormData(e.currentTarget);
    let uploaded: MediaItem[] = [];
    if (mediaFiles.length > 0) {
      try {
        uploaded = await uploadMedia(mediaFiles);
      } catch (err: any) {
        notify({ title: "Falha no upload", description: err?.message ?? "Erro inesperado", variant: "error" });
        return;
      }
    }
    const normalizedExisting = (existingMedia ?? []).map((m: any) => ({ url: m.url ?? m.Url, type: m.type ?? m.Type, fileName: m.fileName ?? m.FileName }));
    const mergedMedia = [...normalizedExisting, ...uploaded].map((m) => ({ url: m.url, type: m.type }));
    const payload = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      price: Number(fd.get("price")),
      categoryId: fd.get("categoryId") as string,
      quantity: Number(fd.get("quantity")),
      stock: Number(fd.get("stock")),
      media: mergedMedia,
    };
    updateMut.mutate(
      { id: editing.id, payload },
      { onSuccess: () => notify({ title: "Editado com sucesso", variant: "success" }), onError: () => notify({ title: "Falha ao editar", variant: "error" }) }
    );
    setEditing(null);
    setMediaFiles([]);
    setExistingMedia([]);
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
        <Card className="w-full max-w-5xl p-4">
          <form onSubmit={handleCreateSubmit} className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Nome do produto</label>
                <Input name="name" placeholder="Camiseta Neon Black" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Descrição (curta)</label>
                <Input name="description" placeholder="Camiseta preta com detalhe neon" />
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Preço (R$)</label>
                <Input name="price" type="number" step="0.01" placeholder="149.90" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Categoria</label>
                <select name="categoryId" className="h-10 w-full rounded-md border border-border bg-background px-2 text-foreground">
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Quantidade</label>
                <Input name="quantity" type="number" placeholder="1" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Estoque</label>
                <Input name="stock" type="number" placeholder="20" />
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Mídias (foto/vídeo)</label>
                <Input
                  name="media"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => setMediaFiles(Array.from(e.target.files ?? []))}
                />
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, GIF, MP4, WEBM, MOV</p>
              </div>
              <div className="flex items-end">
                <Button type="submit">Criar</Button>
              </div>
            </div>
            {mediaPreviews.length > 0 && (
              <MediaPreviewGrid title="Prévia das mídias" items={mediaPreviews} />
            )}
          </form>
        </Card>
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
                    <Button size="sm" variant="secondary" onClick={() => { setEditing(p); setExistingMedia(p.media ?? []); setMediaFiles([]); }}>Editar</Button>
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
      <EditProductDialog
        open={!!editing}
        onOpenChange={(value) => { if (!value) setEditing(null); }}
        product={editing}
        categories={categories}
        onSubmit={handleEditSubmit}
        onMediaChange={setMediaFiles}
        mediaFiles={mediaFiles}
        existingMedia={existingMedia}
      />
    </section>
    </ProtectedRoute>
  );
}

function EditProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSubmit,
  onMediaChange,
  mediaFiles,
  existingMedia,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  product: any;
  categories: any[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onMediaChange: (files: File[]) => void;
  mediaFiles: File[];
  existingMedia: MediaItem[];
}) {
  const normalizedMedia = (existingMedia ?? []).map((m: any) => ({ url: m.url ?? m.Url, type: m.type ?? m.Type }));
  const cover = normalizedMedia[0];
  const editPreviews = useMemo(
    () =>
      mediaFiles.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
        name: file.name,
      })),
    [mediaFiles]
  );

  useEffect(() => {
    return () => {
      editPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [editPreviews]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden border-primary/30 bg-background/80">
        {cover ? (
          cover.type === "video" ? (
            <video className="absolute inset-0 h-full w-full object-cover opacity-30 blur-2xl" src={cover.url} muted loop playsInline autoPlay />
          ) : (
            <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl" style={{ backgroundImage: `url(${cover.url})` }} />
          )
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/90" />
        <div className="relative">
          <DialogHeader>
            <DialogTitle>Editar produto</DialogTitle>
            <DialogDescription>Atualize dados e mídias sem sair da tela.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Nome do produto</label>
                <Input name="name" defaultValue={product?.name} placeholder="Nome do produto" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Preço (R$)</label>
                <Input name="price" type="number" step="0.01" defaultValue={product?.price} placeholder="Preço (R$)" required />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Descrição (curta)</label>
              <Input name="description" defaultValue={product?.description} placeholder="Descrição (curta)" />
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Categoria</label>
                <select name="categoryId" defaultValue={product?.categoryId} className="h-10 rounded-md border border-border bg-background text-foreground px-2">
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Quantidade</label>
                <Input name="quantity" type="number" defaultValue={product?.quantity} placeholder="Qtd" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Estoque</label>
                <Input name="stock" type="number" defaultValue={product?.stock} placeholder="Estoque" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Mídias (foto/vídeo)</label>
              <Input
                name="media"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => onMediaChange(Array.from(e.target.files ?? []))}
              />
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, GIF, MP4, WEBM, MOV</p>
            </div>
            {(normalizedMedia.length > 0 || mediaFiles.length > 0) && (
              <div className="grid gap-2">
                {normalizedMedia.length > 0 && <MediaPreviewGrid title="Mídias atuais" items={normalizedMedia} />}
                {editPreviews.length > 0 && (
                  <MediaPreviewGrid title="Novas mídias" items={editPreviews} />
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MediaPreviewGrid({
  title,
  items,
}: {
  title: string;
  items: Array<{ url: string; type: string; name?: string }>;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
        {items.map((m, i) => (
          <div key={`${m.url}-${i}`} className="overflow-hidden rounded-md border border-border bg-background/60">
            {m.type === "video" ? (
              <video className="h-20 w-full object-cover" src={m.url} muted loop playsInline />
            ) : (
              <img className="h-20 w-full object-cover" src={m.url} alt={m.name ?? "mídia"} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


