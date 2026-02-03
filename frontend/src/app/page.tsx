"use client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { listProductsWithMeta, getBestSellingProductsWithMeta, getLatestProductsWithMeta } from "@/services/products";
import { listCategoriesWithMeta } from "@/services/categories";
import { HorizontalCarousel } from "@/components/ui/carousel";
import { useState } from "react";
import { useCart } from "@/context/cart";
import { useFavorites } from "@/context/favorites";
import { Heart, Search } from "lucide-react";
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
    <Card className="group overflow-hidden transition-shadow hover:shadow-[0_0_24px_rgba(59,130,246,0.25)] border-white/5 bg-white/5">
      <CardHeader className="p-0">
        <QuickView
          id={id}
          name={name}
          price={price}
          media={media}
          trigger={
            cover ? (
              cover.type === "video" ? (
                <div className="aspect-square w-full bg-black flex items-center justify-center cursor-pointer">
                  <video
                    className="h-full w-full object-contain"
                    src={cover.url}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-black/5 flex items-center justify-center cursor-pointer">
                  <img className="h-full w-full object-contain" src={cover.url} alt={name} />
                </div>
              )
            ) : (
              <div className="aspect-square w-full cursor-pointer bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5" />
            )
          }
        />
      </CardHeader>
      <CardContent className="space-y-1 p-4 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Street • Premium</p>
        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-primary font-bold">{price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-center gap-2">
          <Button size="sm" className="flex-1 font-bold h-9" onClick={() => { dispatch({ type: "add", item: { id, name, price, qty: 1, imageUrl: cover?.url } }); notify({ title: "Adicionado ao carrinho", description: name, variant: "success" }); }}>
            Comprar
          </Button>
          <Button variant={isFav(id) ? "default" : "secondary"} size="icon" className="h-9 w-9" aria-label="Favoritar" onClick={() => toggle(id)}>
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
  const { data: catsMeta, isLoading: isLoadingCats } = useQuery({ 
    queryKey: ["cats"], 
    queryFn: () => listCategoriesWithMeta() 
  });
  const cats = catsMeta?.data ?? [];
  
  const { data: productsMeta, isLoading: isLoadingProducts } = useQuery({ 
    queryKey: ["products", q, cat], 
    queryFn: () => listProductsWithMeta({ name: q || undefined, categoryId: cat, page: 1, pageSize: 20 }) 
  });
  const products = productsMeta?.data;
  
  const { data: bestMeta, isLoading: isLoadingBest } = useQuery({ 
    queryKey: ["bestSelling"], 
    queryFn: () => getBestSellingProductsWithMeta(10) 
  });
  const bestSelling = bestMeta?.data ?? [];
  
  const { data: latestMeta, isLoading: isLoadingLatest } = useQuery({ 
    queryKey: ["latest"], 
    queryFn: () => getLatestProductsWithMeta(10) 
  });
  const latest = latestMeta?.data ?? [];

  const isLoading = isLoadingProducts || isLoadingCats;

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
        <div className="border-t p-4 flex flex-wrap items-center gap-4 bg-background/50 backdrop-blur-md sticky top-0 z-20 shadow-sm">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Buscar produtos, marcas e categorias..." 
              className="w-full pl-10 h-11 bg-background/50 border-white/10 focus-visible:ring-primary" 
            />
          </div>
          
          <div className="hidden md:flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar scroll-smooth flex-1 max-w-[calc(100vw-35rem)]">
            <button 
              onClick={() => setCat(undefined)} 
              className={`whitespace-nowrap px-5 py-2.5 transition-all rounded-full text-sm font-bold border-2 ${!cat ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105" : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-foreground hover:border-white/20"}`}
            >
              Todas as Peças
            </button>
            {cats?.map((c) => (
              <button 
                key={c.id} 
                onClick={() => setCat(c.id)} 
                className={`whitespace-nowrap px-5 py-2.5 transition-all rounded-full text-sm font-bold border-2 ${cat === c.id ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105" : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-foreground hover:border-white/20"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
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
        <aside className="hidden md:block space-y-5 rounded-xl border p-4 sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto no-scrollbar scroll-smooth">
          <div className="space-y-4">
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Filtrar Categoria</h3>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setCat(undefined)} 
                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${!cat ? "bg-primary/10 text-primary font-bold border-l-4 border-primary" : "hover:bg-white/5 text-muted-foreground hover:text-foreground hover:pl-4"}`}
                >
                  Todas as Peças
                </button>
                {cats?.map((c) => (
                  <button 
                    key={c.id} 
                    onClick={() => setCat(c.id)} 
                    className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${cat === c.id ? "bg-primary/10 text-primary font-bold border-l-4 border-primary" : "hover:bg-white/5 text-muted-foreground hover:text-foreground hover:pl-4"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Faixa de preço</h3>
              <div className="flex flex-wrap gap-2">
                {["0–99", "100–199", "200–299", "300–499", "500+"].map((label) => (
                  <Badge 
                    key={label} 
                    onClick={() => setQ(label)} 
                    className={`cursor-pointer transition-all ${q === label ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Atalhos</h3>
              <ul className="space-y-1 text-sm">
                <li className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground cursor-pointer transition-colors">Favoritos</li>
                <li className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground cursor-pointer transition-colors">Novidades</li>
                <li className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground cursor-pointer transition-colors">Mais vendidos</li>
              </ul>
            </div>
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
