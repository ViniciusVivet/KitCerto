"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HorizontalCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  function scrollBy(amount: number) {
    ref.current?.scrollBy({ left: amount, behavior: "smooth" });
  }
  return (
    <div className="relative">
      <div ref={ref} className="flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
        <Button size="icon" variant="secondary" className="pointer-events-auto" onClick={() => scrollBy(-300)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
        <Button size="icon" variant="secondary" className="pointer-events-auto" onClick={() => scrollBy(300)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


