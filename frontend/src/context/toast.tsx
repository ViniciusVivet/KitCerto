"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Toast = { id: string; title: string; description?: string; variant?: "default" | "success" | "error" };

const ToastCtx = createContext<{ notify: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function notify(t: Omit<Toast, "id">) {
    const id = Math.random().toString(36).slice(2);
    const next: Toast = { id, ...t };
    setToasts((prev) => [...prev, next]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3000);
  }

  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      {/* Centro superior, levemente translúcido */}
      <div aria-live="polite" className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        <div className="flex w-full max-w-md flex-col gap-2 px-4">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={
                "pointer-events-auto rounded-lg border p-4 shadow-xl backdrop-blur bg-background/80 transition-opacity " +
                (t.variant === "success"
                  ? "border-emerald-500/30"
                  : t.variant === "error"
                  ? "border-red-500/30"
                  : "border-border")
              }
            >
              <div className="text-sm font-medium">{t.title}</div>
              {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
            </div>
          ))}
        </div>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}


