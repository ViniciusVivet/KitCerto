"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import React from "react";
import { useToast } from "@/context/toast";
import { X } from "lucide-react";

export function QuickView({ trigger, id, name, price, media }: { trigger: React.ReactNode; id: string; name: string; price: number; media?: { url: string; type: string }[] }) {
  const { dispatch } = useCart();
  const [open, setOpen] = React.useState(false);
  const [qty, setQty] = React.useState(1);
  const [size, setSize] = React.useState<string | null>(null);
  const [color, setColor] = React.useState<string | null>(null);
  const { notify } = useToast();
  const mediaList = media ?? [];
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = mediaList[activeIndex];
  const thumbs = mediaList;
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const [zoomScale, setZoomScale] = React.useState(1);
  const [dragging, setDragging] = React.useState(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const dragStart = React.useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const swipeStart = React.useRef<{ x: number } | null>(null);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [mediaList.length]);

  React.useEffect(() => {
    if (!open || mediaList.length === 0) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, mediaList.length]);

  function handlePrev() {
    if (mediaList.length === 0) return;
    setActiveIndex((i) => (i - 1 + mediaList.length) % mediaList.length);
  }

  function handleNext() {
    if (mediaList.length === 0) return;
    setActiveIndex((i) => (i + 1) % mediaList.length);
  }

  function openZoom() {
    if (!active || active.type !== "image") return;
    setZoomScale(1);
    setOffset({ x: 0, y: 0 });
    setZoomOpen(true);
  }

  function handleDragStart(e: React.MouseEvent<HTMLImageElement>) {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }

  function handleDragMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  }

  function handleDragEnd() {
    setDragging(false);
    dragStart.current = null;
  }

  function handleSwipeStart(e: React.PointerEvent<HTMLDivElement>) {
    swipeStart.current = { x: e.clientX };
  }

  function handleSwipeEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (!swipeStart.current) return;
    const dx = e.clientX - swipeStart.current.x;
    swipeStart.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) handlePrev();
    else handleNext();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[98vw] max-w-[90rem] h-[92vh] flex flex-col p-0 overflow-hidden border-primary/20 bg-background/95 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Lado Esquerdo: Media (Maior) */}
          <div className="relative flex-[2.5] bg-black/40 flex flex-col border-r border-white/5">
            <div
              className="relative flex-1 w-full flex items-center justify-center overflow-hidden"
              onPointerDown={handleSwipeStart}
              onPointerUp={handleSwipeEnd}
              onPointerCancel={handleSwipeEnd}
              onPointerLeave={handleSwipeEnd}
            >
              {active ? (
                active.type === "video" ? (
                  <video className="max-h-full max-w-full object-contain pointer-events-none" src={active.url} muted loop playsInline autoPlay />
                ) : (
                  <img className="max-h-full max-w-full object-contain cursor-zoom-in select-none" src={active.url} alt={name} onClick={openZoom} />
                )
              ) : null}
              
              {mediaList.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-4 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-110 active:scale-95"
                    onClick={handlePrev}
                  >
                    ◀
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-4 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-110 active:scale-95"
                    onClick={handleNext}
                  >
                    ▶
                  </button>
                </>
              )}
            </div>

            {/* Thumbs Horizontais (Opcional, se preferir embaixo) */}
            {mediaList.length > 1 && (
              <div className="h-24 w-full bg-black/10 backdrop-blur-sm p-2 flex justify-center gap-2 overflow-x-auto border-t border-white/5">
                {mediaList.map((m, idx) => (
                  <button 
                    key={idx} 
                    className={`h-full aspect-square rounded-md border-2 overflow-hidden transition-all ${idx === activeIndex ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"}`} 
                    onClick={() => setActiveIndex(idx)}
                  >
                    {m.type === "video" ? (
                      <video className="h-full w-full object-cover" src={m.url} muted />
                    ) : (
                      <img className="h-full w-full object-cover" src={m.url} alt={name} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lado Direito: Info */}
          <div className="flex-1 flex flex-col border-l border-white/5 bg-background p-6 overflow-y-auto">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{name}</h2>
                <div className="mt-2 text-2xl font-semibold text-primary">{price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>

            <div className="space-y-8 flex-1">
              <div>
                <div className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">Tamanho</div>
                <div className="flex flex-wrap gap-3">
                  {["P", "M", "G", "GG"].map((s) => (
                    <button key={s} onClick={() => setSize(s)} className={`h-12 w-14 rounded-xl border-2 transition-all font-semibold ${size === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">Cor</div>
                <div className="flex flex-wrap gap-3">
                  {["Preto", "Branco", "Azul"].map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={`h-12 px-6 rounded-xl border-2 transition-all font-semibold ${color === c ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"}`}>{c}</button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-muted/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quantidade</span>
                  <div className="flex items-center gap-4 bg-background rounded-full p-1 border">
                    <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                    <span className="w-4 text-center font-bold">{qty}</span>
                    <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors" onClick={() => setQty((q) => q + 1)}>+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold">{(price * qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-8"
              onClick={() => {
                dispatch({ type: "add", item: { id, name, price, qty } });
                notify({ title: "Adicionado ao carrinho", description: `${name} (${size ?? "-"}/${color ?? "-"})`, variant: "success" });
                setOpen(false);
              }}
              disabled={!size || !color}
            >
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </DialogContent>
      {zoomOpen && active?.type === "image" && (
        <div
          className="fixed inset-0 z-[60] bg-black/80"
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div className="absolute right-4 top-4 flex gap-2">
            <button className="rounded-md bg-white/10 px-3 py-1 text-sm text-white" onClick={() => setZoomScale((s) => Math.max(1, s - 0.25))}>-</button>
            <button className="rounded-md bg-white/10 px-3 py-1 text-sm text-white" onClick={() => setZoomScale((s) => Math.min(3, s + 0.25))}>+</button>
            <button className="rounded-md bg-white/10 px-3 py-1 text-sm text-white" onClick={() => setZoomOpen(false)}>Fechar</button>
          </div>
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={active.url}
              alt={name}
              className={`max-h-[85vh] max-w-[85vw] cursor-grab ${dragging ? "cursor-grabbing" : ""}`}
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomScale})` }}
              onMouseDown={handleDragStart}
              draggable={false}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
}


