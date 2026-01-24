"use client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { listProductsWithMeta, listCategoriesWithMeta, getBestSellingProductsWithMeta, getLatestProductsWithMeta } from "@/services/products";
import { HorizontalCarousel } from "@/components/ui/carousel";
import { useState } from "react";
import { useCart } from "@/context/cart";
import { useFavorites } from "@/context/favorites";
import { Heart } from "lucide-react";
import { QuickView } from "@/components/product/QuickView";
import { useToast } from "@/context/toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/auth";

function ProductCard({ id, name, price, media }: { id: string; name: string; price: number; media?: { url: string; type: string }[] }) {
  const { dispatch } = useCart();
  const { isFav, toggle } = useFavorites();
  const { notify } = useToast();
  const cover = media?.[0];
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]">
      <CardHeader className="p-0">
        <QuickView
          id={id}
          name={name}
          price={price}
          media={media}
          trigger={
            cover ? (
              cover.type === "video" ? (
                <video
                  className="aspect-square w-full object-cover"
                  src={cover.url}
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <img className="aspect-square w-full object-cover" src={cover.url} alt={name} />
              )
            ) : (
              <div className="aspect-square w-full cursor-pointer bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5" />
            )
          }
        />
      </CardHeader>
      <CardContent className="space-y-1 p-4">
        <p className="text-sm text-muted-foreground">Street • Semi-jóias</p>
        <h3 className="font-medium">{name}</h3>
        <p className="text-primary font-semibold">{price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-center gap-2">
          <Button className="flex-1" onClick={() => { dispatch({ type: "add", item: { id, name, price, qty: 1 } }); notify({ title: "Adicionado ao carrinho", description: name, variant: "success" }); }}>
            Adicionar ao carrinho
          </Button>
          <Button variant={isFav(id) ? "default" : "secondary"} size="icon" aria-label="Favoritar" onClick={() => toggle(id)}>
            <Heart className={`h-4 w-4 ${isFav(id) ? "fill-primary" : ""}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function Home() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | undefined>(undefined);
  const { isAuthenticated, register } = useAuth();
  const { data: catsMeta } = useQuery({ queryKey: ["cats", typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('data') : undefined], queryFn: () => listCategoriesWithMeta() });
  const cats = catsMeta?.data;
  const { data: productsMeta, isLoading } = useQuery({ queryKey: ["products", q, cat, typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('data') : undefined], queryFn: () => listProductsWithMeta({ name: q || undefined, categoryId: cat, page: 1, pageSize: 20 }) });
  const products = productsMeta?.data;
  const { data: bestMeta } = useQuery({ queryKey: ["bestSelling", typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('data') : undefined], queryFn: () => getBestSellingProductsWithMeta(10) });
  const bestSelling = bestMeta?.data;
  const { data: latestMeta } = useQuery({ queryKey: ["latest", typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('data') : undefined], queryFn: () => getLatestProductsWithMeta(10) });
  const latest = latestMeta?.data;

  return (
    <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-5 lg:px-7">
      {/* Banners/hero rotativos (mock simples) */}
      <section className="mb-8 rounded-xl border p-0 overflow-hidden -mx-4 sm:-mx-5 lg:-mx-7">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-transparent p-6">
            <h2 className="text-xl font-semibold">Streetwear Neon</h2>
            <p className="text-sm text-muted-foreground">Coleção com brilho único</p>
          </div>
          <div className="hidden md:block bg-gradient-to-r from-accent/20 via-primary/10 to-transparent p-6">
            <h2 className="text-xl font-semibold">Jóias & Semi-jóias</h2>
            <p className="text-sm text-muted-foreground">Detalhes que fazem a diferença</p>
          </div>
          <div className="hidden md:block bg-gradient-to-r from-primary/20 via-accent/10 to-transparent p-6">
            <h2 className="text-xl font-semibold">Outfits</h2>
            <p className="text-sm text-muted-foreground">Monte seu look com estilo</p>
          </div>
        </div>
        <div className="border-t p-4 flex flex-wrap items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produtos..." className="w-full sm:w-96" />
          <div className="hidden md:flex flex-wrap gap-2">
            <Badge onClick={() => setCat(undefined)} className={!cat ? "bg-primary text-primary-foreground" : "cursor-pointer"}>Todas</Badge>
            {cats?.map((c) => (
              <Badge key={c.id} onClick={() => setCat(c.id)} className={cat === c.id ? "bg-primary text-primary-foreground" : "cursor-pointer"}>
                {c.name}
              </Badge>
            ))}
          </div>
          {!isAuthenticated && (
            <Button onClick={register} className="ml-auto">Registrar</Button>
          )}
          {/* Trigger filtros mobile */}
          <Sheet>
            <SheetTrigger className="md:hidden"><Badge className="cursor-pointer">Filtros</Badge></SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="mb-1 text-sm font-medium">Categorias</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge onClick={() => setCat(undefined)} className={!cat ? "bg-primary text-primary-foreground" : "cursor-pointer"}>Todas</Badge>
                    {cats?.map((c) => (
                      <Badge key={c.id} onClick={() => setCat(c.id)} className={cat === c.id ? "bg-primary text-primary-foreground" : "cursor-pointer"}>{c.name}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium">Faixa de preço</h3>
                  <div className="flex flex-wrap gap-2">
                    {["0–99", "100–199", "200–299", "300–499", "500+"].map((label) => (
                      <Badge key={label} onClick={() => setQ(label)} className="cursor-pointer">{label}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      {/* Grid com barra lateral (desktop) – fica visível logo após o hero */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        <aside className="hidden md:block space-y-5 rounded-xl border p-3 sticky top-24 max-h-[calc(100dvh-7rem)] overflow-auto">
          <div>
            <h3 className="mb-1 text-sm font-medium">Categorias</h3>
            <p className="mb-3 text-xs text-muted-foreground">Selecione para filtrar os resultados</p>
            <div className="flex flex-wrap gap-2">
              <Badge onClick={() => setCat(undefined)} className={!cat ? "bg-primary text-primary-foreground" : "cursor-pointer"}>Todas</Badge>
              {cats?.map((c) => (
                <Badge key={c.id} onClick={() => setCat(c.id)} className={cat === c.id ? "bg-primary text-primary-foreground" : "cursor-pointer"}>{c.name}</Badge>
              ))}
            </div>
          </div>
          <hr className="border-border" />
          <div>
            <h3 className="mb-1 text-sm font-medium">Faixa de preço</h3>
            <p className="mb-3 text-xs text-muted-foreground">Atalhos rápidos</p>
            <div className="flex flex-wrap gap-2">
              {["0–99", "100–199", "200–299", "300–499", "500+"].map((label) => (
                <Badge key={label} onClick={() => setQ(label)} className="cursor-pointer">{label}</Badge>
              ))}
            </div>
          </div>
          <hr className="border-border" />
          <div>
            <h3 className="mb-1 text-sm font-medium">Atalhos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer">Favoritos</li>
              <li className="hover:text-foreground cursor-pointer">Novidades</li>
              <li className="hover:text-foreground cursor-pointer">Mais vendidos</li>
            </ul>
          </div>
        </aside>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {isLoading && Array.from({ length: 10 }).map((_, i) => (
            <Card key={`sk-top-${i}`} className="h-full animate-pulse">
              <div className="aspect-square w-full bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-1/2 bg-muted" />
                <div className="h-4 w-2/3 bg-muted" />
              </div>
            </Card>
          ))}
          {!isLoading && products?.items?.map((p) => (
            <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} media={p.media} />
          ))}
        </div>
      </section>

      {/* Carrossel de mais vendidos */}
      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-semibold">Mais vendidos</h2>
        <HorizontalCarousel>
          {(bestSelling ?? []).map((p) => (
            <div key={p.id} className="min-w-[180px] max-w-[180px]">
              <ProductCard id={p.id} name={p.name} price={p.price} media={p.media} />
            </div>
          ))}
        </HorizontalCarousel>
      </section>

      {/* Carrossel de novidades */}
      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-semibold">Novidades</h2>
        <HorizontalCarousel>
          {(latest ?? []).map((p) => (
            <div key={p.id} className="min-w-[180px] max-w-[180px]">
              <ProductCard id={p.id} name={p.name} price={p.price} media={p.media} />
            </div>
          ))}
        </HorizontalCarousel>
      </section>

      {/* (Grid com barra lateral removido daqui; movido para logo após o hero) */}
    </div>
  );
}
