"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: number | string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "products", label: "Produtos", href: "/dashboard/produtos", icon: Package },
  { id: "categories", label: "Gestão de Categorias", href: "/dashboard/categorias", icon: ListOrdered },
  { id: "stock", label: "Estoque", href: "/dashboard/estoque", icon: Boxes },
  { id: "orders", label: "Pedidos", href: "/dashboard/pedidos", icon: ShoppingCart, badge: 4 },
  { id: "customers", label: "Clientes", href: "/dashboard/clientes", icon: Users },
  { id: "reports", label: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
  { id: "settings", label: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
  { id: "help", label: "Ajuda", href: "/dashboard/ajuda", icon: HelpCircle },
];

export function DashboardSidebar({ className }: { className?: string }) {
  const [active, setActive] = React.useState<string>("overview");

  return (
    <aside className={cn("w-64 shrink-0 border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      {/* Logo */}
      <div className="sticky top-0 z-10 border-b bg-background/70 px-5 py-4">
        <div className="text-lg font-semibold tracking-tight">KitCerto</div>
      </div>

      {/* Items */}
      <nav className="h-[calc(100vh-57px)] overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} href={item.href ?? "#"} onClick={() => setActive(item.id)}>
              <Button
                variant={active === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  active === item.id && "bg-muted"
                )}
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
          ))}
        </div>
      </nav>
    </aside>
  );
}


