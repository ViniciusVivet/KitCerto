"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastVariant = "default" | "success" | "error";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

const ToastCtx = createContext<{ notify: (t: Omit<Toast, "id">) => void } | null>(null);

const DURATION = 3000;

const variantConfig: Record<ToastVariant, { border: string; glow: string; icon: React.ReactNode }> = {
  success: {
    border: "border-emerald-500/40",
    glow: "shadow-[0_0_36px_rgba(16,185,129,0.28)]",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />,
  },
  error: {
    border: "border-red-500/40",
    glow: "shadow-[0_0_36px_rgba(239,68,68,0.28)]",
    icon: <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />,
  },
  default: {
    border: "border-primary/30",
    glow: "shadow-[0_0_36px_rgba(59,130,246,0.26)]",
    icon: <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />,
  },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const { border, glow, icon } = variantConfig[toast.variant ?? "default"];

  // pequeno delay para disparar a transição CSS de entrada
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={[
        "relative flex items-start gap-4 rounded-xl border px-5 py-4",
        "bg-zinc-950/92 backdrop-blur-xl",
        border,
        glow,
        "ring-1 ring-white/[0.06]",
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95",
      ].join(" ")}
    >
      {/* reflexo holográfico interno */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />

      {icon}

      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-white leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm text-zinc-400 leading-snug">{toast.description}</p>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => dismiss(id), DURATION);
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      {/* canto inferior direito — não bloqueia conteúdo */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-4 z-[60] flex w-full max-w-[29rem] flex-col gap-2.5 sm:right-6"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onClose={dismiss} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
