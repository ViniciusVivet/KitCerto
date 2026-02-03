"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFavorites, removeFavorite, type FavoriteItem } from "@/services/favorites";
import { apiBaseUrl } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";

function imageSrc(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = apiBaseUrl.replace(/\/api\/?$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

export default function FavoritosPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => listFavorites(),
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      notify({ title: "Removido dos favoritos", variant: "success" });
    },
    onError: (e: Error) => notify({ title: "Erro", description: e.message, variant: "error" }),
  });

  if (isLoading) {
    return (
      <>
        <section className="mb-6">
          <h1 className="text-2xl font-semibold">Favoritos</h1>
          <p className="text-sm text-muted-foreground">Produtos que você salvou para comprar depois.</p>
        </section>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-32 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">Favoritos</h1>
        <p className="text-sm text-muted-foreground">Produtos que você salvou para comprar depois.</p>
      </section>

      {items.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
            <Heart className="h-12 w-12" />
            <p>Nenhum favorito ainda. Adicione produtos na loja para vê-los aqui.</p>
            <Button asChild><Link href="/">Ver produtos</Link></Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item.productId} className="overflow-hidden">
              <Link href={`/?product=${item.productId}`} className="block">
                <div className="aspect-square bg-muted relative">
                  {item.imageUrl ? (
                    <img src={imageSrc(item.imageUrl)} alt={item.productName ?? ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">?</div>
                  )}
                </div>
              </Link>
              <CardContent className="p-4 flex flex-col gap-2">
                <Link href={`/?product=${item.productId}`} className="font-medium hover:underline line-clamp-2">
                  {item.productName ?? "Produto"}
                </Link>
                <p className="text-sm text-primary font-semibold">
                  {item.price != null ? item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/?product=${item.productId}`}>Ver produto</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Remover dos favoritos"
                    onClick={() => removeMutation.mutate(item.productId)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
