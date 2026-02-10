"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCategories, createCategory, updateCategory, deleteCategory } from "@/services/categories";
import { getDashboardOverview } from "@/services/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Edit, Trash2, Plus, Search, Tag, Info, AlertTriangle, ArrowRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriasPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const { notify } = useToast();
  
  const [editing, setEditing] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Queries
  const { data: categoriesRaw, isLoading: isLoadingCats } = useQuery({ 
    queryKey: ["cats"], 
    queryFn: () => listCategories(undefined, true) 
  });

  const { data: overview } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => getDashboardOverview(true)
  });

  // Mapeamentos e Filtros
  const categories = useMemo(() => {
    if (Array.isArray(categoriesRaw)) return categoriesRaw;
    if (categoriesRaw && typeof categoriesRaw === 'object' && (categoriesRaw as any).items && Array.isArray((categoriesRaw as any).items)) {
      return (categoriesRaw as any).items;
    }
    return [];
  }, [categoriesRaw]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    overview?.byCategory?.forEach(item => {
      counts[item.categoryId] = item.count;
    });
    return counts;
  }, [overview]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat: any) => 
      (cat.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const emptyCategoriesCount = useMemo(() => {
    if (!categories.length) return 0;
    return categories.filter((cat: { id?: string }) => !categoryCounts[cat.id]).length;
  }, [categories, categoryCounts]);

  // Mutations
  const createMut = useMutation({
    mutationFn: (payload: any) => createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cats"] });
      qc.invalidateQueries({ queryKey: ["dashboard-overview"] });
      notify({ title: "Categoria criada", variant: "success" });
      setIsAdding(false);
    },
    onError: () => notify({ title: "Falha ao criar categoria", variant: "error" })
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cats"] });
      notify({ title: "Categoria atualizada", variant: "success" });
      setEditing(null);
    },
    onError: () => notify({ title: "Falha ao editar categoria", variant: "error" })
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cats"] });
      qc.invalidateQueries({ queryKey: ["dashboard-overview"] });
      notify({ title: "Categoria excluída", variant: "success" });
      setDeletingId(null);
    },
    onError: () => {
      notify({ 
        title: "Falha ao excluir", 
        description: "Verifique se existem produtos vinculados a esta categoria.", 
        variant: "error" 
      });
      setDeletingId(null);
    }
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
    };

    if (editing) {
      updateMut.mutate({ id: editing.id, payload });
    } else {
      createMut.mutate(payload);
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <section className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
            <p className="text-muted-foreground text-lg">
              Organize seu catálogo e facilite a busca para seus clientes.
            </p>
          </div>
          <Button onClick={() => { setEditing(null); setIsAdding(true); }} className="h-12 gap-2 px-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="h-5 w-5" /> Nova Categoria
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/10 bg-primary/5 transition-colors hover:bg-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
              <Tag className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Categorias ativas no sistema</p>
            </CardContent>
          </Card>
          <Card className="border-accent/10 bg-accent/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Produtos Vinculados</CardTitle>
              <Package className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalProducts ?? "--"}</div>
              <p className="text-xs text-muted-foreground">Total de produtos no catálogo</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/10 bg-destructive/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Categorias Vazias</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emptyCategoriesCount}</div>
              <p className="text-xs text-muted-foreground">Sem produtos vinculados</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Filtrar categorias por nome ou descrição..." 
            className="h-12 pl-10 text-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoadingCats ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-48 animate-pulse border-none bg-muted/30" />
            ))
          ) : filteredCategories.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <Tag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente buscar por outro termo ou limpe o filtro." : "Comece criando sua primeira categoria!"}
              </p>
              {searchTerm && (
                <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-primary">
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            filteredCategories.map((cat: any) => (
              <Card key={cat.id} className="group flex flex-col overflow-hidden border-border/50 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                        onClick={() => setEditing(cat)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeletingId(cat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="mt-4 text-xl group-hover:text-primary transition-colors">
                    {cat.name || <span className="text-muted-foreground/40 italic">Sem Nome</span>}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {cat.description || "Sem descrição definida para esta categoria."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0 space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3" />
                      <span>{categoryCounts[cat.id] ?? 0} produtos</span>
                    </div>
                    {(!cat.name || !cat.description) && (
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground/60 border-muted-foreground/20">
                        Incompleta
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all group/btn"
                    onClick={() => router.push(`/dashboard/produtos?categoryId=${cat.id}`)}
                  >
                    Ver Produtos 
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingId} onOpenChange={(val) => { if(!val) setDeletingId(null); }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" /> Confirmar Exclusão
              </DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e falhará se houver produtos vinculados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={() => setDeletingId(null)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deletingId && deleteMut.mutate(deletingId)}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? "Excluindo..." : "Excluir Categoria"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Dialog */}
        <Dialog open={isAdding || !!editing} onOpenChange={(val) => { if(!val) { setIsAdding(false); setEditing(null); } }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editing ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para organizar seu catálogo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Nome da Categoria
                  </label>
                  <Input 
                    name="name" 
                    defaultValue={editing?.name} 
                    placeholder="Ex: Streetwear, Relógios, Acessórios..." 
                    required 
                    className="h-12 text-lg focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4" /> Descrição
                  </label>
                  <textarea 
                    name="description" 
                    defaultValue={editing?.description} 
                    placeholder="Descreva o que os clientes encontrarão nesta categoria..." 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); setEditing(null); }} className="h-12 flex-1 sm:flex-none">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMut.isPending || updateMut.isPending}
                  className="h-12 flex-1 sm:flex-none min-w-[120px] font-bold shadow-lg shadow-primary/20"
                >
                  {createMut.isPending || updateMut.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Salvando...
                    </div>
                  ) : (
                    editing ? "Atualizar Categoria" : "Criar Categoria"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    </ProtectedRoute>
  );
}
