"use client";

import { ClientAreaSidebar } from "@/components/layout/ClientAreaSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MeusPedidosLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute unauthTitle="Área do cliente" unauthMessage="Faça login para acessar sua conta.">
      <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-5 lg:px-7">
        <section className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
          <ClientAreaSidebar />
          <div>{children}</div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
