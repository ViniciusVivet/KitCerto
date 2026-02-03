"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Package, AlertTriangle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useMemo } from "react";

export default function RelatoriosPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => getDashboardOverview(true)
  });

  const totalInventoryValue = overview?.totalValue ?? 0;
  const categoriesCount = overview?.byCategory?.length ?? 0;

  return (
    <ProtectedRoute requiredRole="admin">
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Relatórios Analíticos</h1>
            <p className="text-sm text-muted-foreground">Dados detalhados para tomada de decisão estratégica.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportar Tudo (PDF/XLS)
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ReportKpi 
            title="Giro de Estoque" 
            value="1.2x" 
            desc="+5% este mês" 
            icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} 
          />
          <ReportKpi 
            title="Ticket Médio" 
            value={(overview?.totalProducts ? (totalInventoryValue / overview.totalProducts) : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} 
            desc="Média por item" 
            icon={<FileText className="h-4 w-4 text-primary" />} 
          />
          <ReportKpi 
            title="Alerta de Ruptura" 
            value={overview?.lowStockItems?.length ?? 0} 
            desc="Itens para reposição" 
            icon={<AlertTriangle className="h-4 w-4 text-destructive" />} 
          />
          <ReportKpi 
            title="Capacidade" 
            value={categoriesCount} 
            desc="Categorias ativas" 
            icon={<Package className="h-4 w-4 text-amber-500" />} 
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Categoria</CardTitle>
              <CardDescription>Valor total investido em cada setor da loja.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : (
                overview?.byCategoryValue?.map((cat) => (
                  <div key={cat.categoryId} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{cat.categoryName || "Geral"}</p>
                      <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(cat.value / totalInventoryValue) * 100}%` }} 
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold">
                      {cat.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Produtos por Valor</CardTitle>
              <CardDescription>Itens que representam o maior capital imobilizado.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                ) : (
                  overview?.topProductsByValue?.map((prod) => (
                    <div key={prod.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm truncate max-w-[200px]">{prod.name}</span>
                      <span className="text-sm font-mono font-bold">
                        {prod.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </ProtectedRoute>
  );
}

function ReportKpi({ title, value, desc, icon }: { title: string; value: string | number; desc: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
