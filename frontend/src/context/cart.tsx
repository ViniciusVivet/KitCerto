"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";

export type CartItem = { id: string; name: string; price: number; qty: number; imageUrl?: string };
type CartState = { items: CartItem[] };
type Action =
  | { type: "add"; item: CartItem }
  | { type: "remove"; id: string }
  | { type: "inc"; id: string }
  | { type: "dec"; id: string }
  | { type: "clear" };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "add": {
      const found = state.items.find((i) => i.id === action.item.id);
      if (found) {
        return {
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, qty: i.qty + action.item.qty, imageUrl: action.item.imageUrl ?? i.imageUrl }
              : i
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }
    case "remove":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "inc":
      return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i)) };
    case "dec":
      return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i)) };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

const CartCtx = createContext<{ state: CartState; dispatch: React.Dispatch<Action> } | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kitcerto:cart");
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw);
        parsed.forEach((it) => dispatch({ type: "add", item: it }));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem("kitcerto:cart", JSON.stringify(state.items));
    } catch {}
  }, [state.items]);
  return <CartCtx.Provider value={{ state, dispatch }}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  const subtotal = ctx.state.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  return { ...ctx, subtotal };
}


