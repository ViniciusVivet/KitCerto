"use client";

import { useQuery } from "@tanstack/react-query";
import { listActiveCoupons, type Coupon } from "@/services/coupons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast";
import { Ticket, Copy, Percent, Calendar } from "lucide-react";

function formatDiscount(c: Coupon): string {
  if (c.discountType === "percent")
    return `${c.discountValue}% off`;
  return `${c.discountValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} off`;
}

export default function CuponsPage() {
  const { notify } = useToast();
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => listActiveCoupons(),
  });

  const copyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      notify({ title: "Código copiado", description: code, variant: "success" });
    }
  };

  if (isLoading) {
    return (
      <>
        <section className="mb-6">
          <h1 className="text-2xl font-semibold">Cupons</h1>
          <p className="text-sm text-muted-foreground">Cupons disponíveis e histórico de uso.</p>
        </section>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">Cupons</h1>
        <p className="text-sm text-muted-foreground">Cupons disponíveis. Use o código na finalização da compra.</p>
      </section>

      {coupons.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
            <Ticket className="h-12 w-12" />
            <p>Nenhum cupom ativo no momento. Fique de olho nas promoções!</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {coupons.map((c) => (
            <Card key={c.id} className="border-primary/20">
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-lg font-mono">{c.code}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {c.description || formatDiscount(c)}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyCode(c.code)} className="gap-1">
                  <Copy className="h-4 w-4" /> Copiar
                </Button>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <Percent className="h-4 w-4" /> {formatDiscount(c)}
                </span>
                {c.minOrderValue > 0 && (
                  <span>Mín. {c.minOrderValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Válido até {new Date(c.validUntil).toLocaleDateString("pt-BR")}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
