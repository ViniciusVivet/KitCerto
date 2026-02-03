"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Package, Heart, MapPin, CreditCard, Ticket, User, LifeBuoy } from "lucide-react";

const ITEMS = [
  { href: "/meus-pedidos/visao-geral", label: "Visão geral", icon: Home },
  { href: "/meus-pedidos", label: "Meus pedidos", icon: Package, exact: true },
  { href: "/meus-pedidos/favoritos", label: "Favoritos", icon: Heart },
  { href: "/meus-pedidos/enderecos", label: "Endereços", icon: MapPin },
  { href: "/meus-pedidos/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/meus-pedidos/cupons", label: "Cupons", icon: Ticket },
  { href: "/meus-pedidos/dados-pessoais", label: "Dados pessoais", icon: User },
  { href: "/meus-pedidos/suporte", label: "Suporte", icon: LifeBuoy },
] as const;

export function ClientAreaSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block space-y-4 rounded-xl border p-3 sticky top-24 h-max">
      <nav className="space-y-1">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="block">
              <Button variant={active ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
