"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import React from "react";
import { useToast } from "@/context/toast";

export function QuickView({ trigger, id, name, price, media }: { trigger: React.ReactNode; id: string; name: string; price: number; media?: { url: string; type: string }[] }) {
  const { dispatch } = useCart();
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

  React.useEffect(() => {
    setActiveIndex(0);
  }, [mediaList.length]);

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

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Detalhes do produto. Escolha quantidade e adicione ao carrinho.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-3 relative aspect-video w-full rounded-md overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5">
            {active ? (
              active.type === "video" ? (
                <video className="h-full w-full object-cover" src={active.url} muted loop playsInline autoPlay />
              ) : (
                <img className="h-full w-full object-cover cursor-zoom-in" src={active.url} alt={name} onClick={openZoom} />
              )
            ) : null}
            {mediaList.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-xs text-white hover:bg-black/60"
                  onClick={handlePrev}
                >
                  ◀
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-xs text-white hover:bg-black/60"
                  onClick={handleNext}
                >
                  ▶
                </button>
              </>
            )}
          </div>
          <div className="col-span-1 flex flex-col gap-2">
            {thumbs.length > 0 ? (
              thumbs.slice(0, 5).map((m, idx) => (
                m.type === "video" ? (
                  <button key={idx} className={`rounded-md border ${idx === activeIndex ? "border-primary" : "border-transparent"}`} onClick={() => setActiveIndex(idx)}>
                    <video className="h-16 w-full rounded-md object-cover" src={m.url} muted loop playsInline />
                  </button>
                ) : (
                  <button key={idx} className={`rounded-md border ${idx === activeIndex ? "border-primary" : "border-transparent"}`} onClick={() => setActiveIndex(idx)}>
                    <img className="h-16 w-full rounded-md object-cover" src={m.url} alt={name} />
                  </button>
                )
              ))
            ) : (
              <>
                <div className="h-16 rounded-md bg-muted" />
                <div className="h-16 rounded-md bg-muted" />
                <div className="h-16 rounded-md bg-muted" />
                <div className="h-16 rounded-md bg-muted" />
              </>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Tamanho</div>
            <div className="flex flex-wrap gap-2">
              {["P", "M", "G", "GG"].map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`rounded-md border px-3 py-1 text-sm ${size === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Cor</div>
            <div className="flex flex-wrap gap-2">
              {["Preto", "Branco", "Azul"].map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`rounded-md border px-3 py-1 text-sm ${color === c ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="rounded-md border px-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <span className="w-8 text-center">{qty}</span>
              <button className="rounded-md border px-2" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <span className="text-xl font-semibold">{(price * qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            <DialogClose asChild>
              <Button
                onClick={() => {
                  dispatch({ type: "add", item: { id, name, price, qty } });
                  notify({ title: "Adicionado ao carrinho", description: `${name} (${size ?? "-"}/${color ?? "-"})`, variant: "success" });
                }}
                disabled={!size || !color}
              >
                Adicionar
              </Button>
            </DialogClose>
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


