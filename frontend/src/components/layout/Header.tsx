"use client";

import Link from "next/link";
import { ShoppingCart, UserRound, Search, Package, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/cart";
import { useToast } from "@/context/toast";
import { useAuth } from "@/context/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { LoginButton } from "@/components/auth/LoginButton";

export function Header() {
  const [open, setOpen] = useState(false);
  const { state } = useCart();
  const { notify } = useToast();
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="font-semibold text-xl tracking-tight">
          <span className="text-foreground">Kit</span>
          <span className="text-primary">Certo</span>
        </Link>

        {/* Search + lateral (mobile trigger no futuro) */}
        <div className="flex-1" />
        <div className="hidden md:block w-full max-w-md">
          <div className="relative">
            <Input
              placeholder="Buscar produtos, marcas e categorias"
              className="pl-10"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Actions */}
        <nav className="ml-auto flex items-center gap-2">
          {/* Navegação principal (desktop) */}
          <Link href="/meus-pedidos" className="hidden sm:inline-block" aria-label="Meus pedidos">
            <Button variant="ghost" className="gap-2">
              <Package className="h-4 w-4" />
              <span>Meus pedidos</span>
            </Button>
          </Link>
          <Link href="/dashboard" className="hidden sm:inline-block" aria-label="Dashboard">
            <Button variant="ghost" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>

          {/* Separador desktop */}
          <div className="hidden sm:block mx-2 h-6 w-px bg-border" />

          {/* Acesso mobile a Meus pedidos */}
          <Link href="/meus-pedidos" className="sm:hidden" aria-label="Meus pedidos">
            <Button variant="ghost" size="icon">
              <Package className="h-5 w-5" />
            </Button>
          </Link>

          {!isAdmin() && (
            <Link href="/quero-vender" className="hidden sm:inline-block" aria-label="Quero vender">
              <Button variant="ghost" className="gap-2">
                <UserRound className="h-4 w-4" />
                <span>Quero vender</span>
              </Button>
            </Link>
          )}
          <LoginButton />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="default" size="icon" aria-label="Abrir carrinho" onClick={() => { if (state.items.length === 0) notify({ title: "Carrinho vazio", description: "Adicione produtos para continuar" }); }}>
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {state.items.length > 0 && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                      {state.items.reduce((acc, i) => acc + i.qty, 0)}
                    </span>
                  )}
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Seu carrinho ({state.items.length})</SheetTitle>
              </SheetHeader>
              <CartContents onClose={() => setOpen(false)} />
              {state.items.length > 0 && (
                <div className="mt-4">
                  <CheckoutModal trigger={<Button className="w-full">Ir para checkout</Button>} />
                </div>
              )}
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}

function CartContents({ onClose }: { onClose: () => void }) {
  const { state, subtotal, dispatch } = useCart();
  if (state.items.length === 0)
    return (
      <div className="mt-4 space-y-4">
        <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
          Seu carrinho está vazio.
        </div>
        <Button className="w-full" onClick={onClose}>Continuar comprando</Button>
      </div>
    );

  return (
    <div className="mt-4 space-y-4">
      <ul className="space-y-2">
        {state.items.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-2 rounded-md border p-3">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-sm text-muted-foreground">{i.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="secondary" onClick={() => dispatch({ type: "dec", id: i.id })}>-</Button>
              <span className="w-6 text-center">{i.qty}</span>
              <Button size="icon" variant="secondary" onClick={() => dispatch({ type: "inc", id: i.id })}>+</Button>
              <Button size="icon" variant="destructive" onClick={() => dispatch({ type: "remove", id: i.id })}>x</Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="font-semibold">{subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
      </div>
      <Button className="w-full" onClick={onClose}>Finalizar compra</Button>
    </div>
  );
}


