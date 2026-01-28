"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProducts, listCategories, updateProductStock } from "@/services/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useToast } from "@/context/toast";
import { Search, AlertCircle, TrendingUp, TrendingDown, Package, Boxes } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function EstoquePage() {
  const qc = useQueryClient();
  const { notify } = useToast();
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const { data: productsRaw, isLoading: isLoadingProducts } = useQuery({ 
    queryKey: ["prod", q, catFilter], 
    queryFn: () => listProducts({ name: q, categoryId: catFilter }, true) 
  });

  const { data: categoriesRaw } = useQuery({ 
    queryKey: ["cats"], 
    queryFn: () => listCategories(undefined, true) 
  });

  const products = useMemo(() => {
    if (productsRaw && (productsRaw as any).items) return (productsRaw as any).items as any[];
    if (Array.isArray(productsRaw)) return productsRaw;
    return [];
  }, [productsRaw]);

  const categories = useMemo(() => Array.isArray(categoriesRaw) ? categoriesRaw : [], [categoriesRaw]);

  const lowStockProducts = useMemo(() => products.filter(p => p.stock < 10), [products]);
  const totalStockValue = useMemo(() => products.reduce((acc, p) => acc + (p.price * p.stock), 0), [products]);

  const updateStockMut = useMutation({
    mutationFn: ({ id, stock }: { id: string, stock: number }) => updateProductStock(id, stock),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prod"] });
      notify({ title: "Estoque atualizado", variant: "success" });
    },
    onError: () => notify({ title: "Erro ao atualizar estoque", variant: "error" })
  });

  const handleAdjustStock = (id: string, currentStock: number, amount: number) => {
    const newStock = Math.max(0, currentStock + amount);
    updateStockMut.mutate({ id, stock: newStock });
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Gestão de Estoque</h1>
          <p className="text-sm text-muted-foreground">Monitore e ajuste o nível de produtos em tempo real.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Itens em Alerta</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockProducts.length}</div>
              <p className="text-xs text-muted-foreground">Produtos com menos de 10 unidades</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.reduce((acc, p) => acc + p.stock, 0)}</div>
              <p className="text-xs text-muted-foreground">Unidades totais em estoque</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Valor do Patrimônio</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStockValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-xs text-muted-foreground">Baseado no preço de venda atual</p>
            </CardContent>
          </Card>
        </div>

        <Card className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar produto…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
            </div>
            <select 
              value={catFilter} 
              onChange={(e) => setCatFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Todas as categorias</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Produto</th>
                  <th className="py-3 text-left">Categoria</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="py-3 text-center">Quantidade</th>
                  <th className="py-3 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingProducts ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b"><td colSpan={5} className="py-4"><Skeleton className="h-8 w-full" /></td></tr>
                  ))
                ) : products.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Nenhum produto no catálogo.</td></tr>
                ) : (
                  products.map((p: any) => (
                    <tr key={p.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {p.id.substring(0, 8)}</div>
                      </td>
                      <td className="py-3 text-muted-foreground">{p.categoryName || "Geral"}</td>
                      <td className="py-3 text-center">
                        {p.stock <= 0 ? (
                          <Badge variant="destructive">Esgotado</Badge>
                        ) : p.stock < 10 ? (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Baixo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Normal</Badge>
                        )}
                      </td>
                      <td className="py-3 text-center font-bold text-lg">{p.stock}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleAdjustStock(p.id, p.stock, -1)}
                            disabled={p.stock <= 0}
                          >
                            <TrendingDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleAdjustStock(p.id, p.stock, 1)}
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </ProtectedRoute>
  );
}
