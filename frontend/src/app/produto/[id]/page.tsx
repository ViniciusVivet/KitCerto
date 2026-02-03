"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/services/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { useToast } from "@/context/toast";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function ProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { dispatch } = useCart();
  const { notify } = useToast();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">ID do produto não informado.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/">Voltar à loja</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-8 w-48 rounded bg-muted animate-pulse mb-6" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-square rounded-lg bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-6 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/">Voltar à loja</Link>
        </Button>
      </div>
    );
  }

  const name = product.name ?? product.Name ?? "";
  const price = product.price ?? product.Price ?? 0;
  const media = product.media ?? product.Media ?? [];
  const cover = Array.isArray(media) ? media[0] : null;
  const imageUrl = cover?.url ?? cover?.Url;

  function handleAddToCart() {
    dispatch({
      type: "add",
      item: { id: product.id ?? id, name, price, qty, imageUrl },
    });
    notify({ title: "Adicionado ao carrinho", description: `${name} (${qty})`, variant: "success" });
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 gap-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Voltar à loja
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
          )}
        </div>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-xl text-primary font-semibold">
            {price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Quantidade</label>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setQty((n) => Math.max(1, n - 1))}
              >
                -
              </Button>
              <span className="w-10 text-center">{qty}</span>
              <Button variant="secondary" size="icon" onClick={() => setQty((n) => n + 1)}>
                +
              </Button>
            </div>
          </div>
          <Button size="lg" className="w-full" onClick={handleAddToCart}>
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </div>
  );
}
