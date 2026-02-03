"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth";
import { getMySeller } from "@/services/sellers";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ListOrdered,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: number | string;
};

const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "products", label: "Produtos", href: "/dashboard/produtos", icon: Package },
  { id: "categories", label: "Gestão de Categorias", href: "/dashboard/categorias", icon: ListOrdered },
  { id: "stock", label: "Estoque", href: "/dashboard/estoque", icon: Boxes },
  { id: "orders", label: "Pedidos", href: "/dashboard/pedidos", icon: ShoppingCart, badge: 4 },
  { id: "customers", label: "Clientes", href: "/dashboard/clientes", icon: Users },
  { id: "reports", label: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
  { id: "chamados", label: "Chamados", href: "/dashboard/chamados", icon: MessageCircle },
  { id: "settings", label: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
  { id: "help", label: "Ajuda", href: "/dashboard/ajuda", icon: HelpCircle },
];

const SELLER_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Minha loja", href: "/dashboard", icon: LayoutDashboard },
  { id: "products", label: "Meus produtos", href: "/dashboard/meus-produtos", icon: Package },
  { id: "orders", label: "Pedidos", href: "/dashboard/pedidos", icon: ShoppingCart },
  { id: "chamados", label: "Chamados", href: "/dashboard/chamados", icon: MessageCircle },
];

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const { data: seller } = useQuery({ queryKey: ["sellers", "me"], queryFn: getMySeller });
  const isSeller = !!seller;
  const navItems = isAdmin() ? ADMIN_NAV_ITEMS : isSeller ? SELLER_NAV_ITEMS : SELLER_NAV_ITEMS;

  return (
    <aside className={cn("w-64 shrink-0 border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="sticky top-0 z-10 border-b bg-background/70 px-5 py-4">
        <div className="text-lg font-semibold tracking-tight">KitCerto</div>
        {isSeller && !isAdmin() && (
          <p className="text-xs text-muted-foreground mt-0.5">{seller.storeName}</p>
        )}
      </div>

      <nav className="h-[calc(100vh-57px)] overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === (item.href ?? "#");
            return (
              <Link key={item.id} href={item.href ?? "#"}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-3", active && "bg-muted")}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge ? (
                    <Badge className="ml-auto" variant="secondary">
                      {item.badge}
                    </Badge>
                  ) : null}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}


