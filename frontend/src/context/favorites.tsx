"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";

type FavoritesState = { ids: Set<string> };
type Action = { type: "toggle"; id: string } | { type: "hydrate"; ids: string[] };

function reducer(state: FavoritesState, action: Action): FavoritesState {
  switch (action.type) {
    case "toggle": {
      const next = new Set(state.ids);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ids: next };
    }
    case "hydrate": {
      return { ids: new Set(action.ids) };
    }
    default:
      return state;
  }
}

const Ctx = createContext<{ state: FavoritesState; dispatch: React.Dispatch<Action> } | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ids: new Set<string>() });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kitcerto:favs");
      if (raw) dispatch({ type: "hydrate", ids: JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("kitcerto:favs", JSON.stringify(Array.from(state.ids)));
    } catch {}
  }, [state.ids]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  const isFav = (id: string) => ctx.state.ids.has(id);
  const toggle = (id: string) => ctx.dispatch({ type: "toggle", id });
  return { ...ctx, isFav, toggle };
}


