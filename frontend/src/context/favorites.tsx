"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFavorites, addFavorite, removeFavorite } from "@/services/favorites";
import { useAuth } from "@/context/auth";

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

type FavoritesContextType = {
  state: FavoritesState;
  dispatch: React.Dispatch<Action>;
  isFav: (id: string) => boolean;
  toggle: (id: string) => void;
  isLoading?: boolean;
};

const Ctx = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ids: new Set<string>() });
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: apiItems = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => listFavorites(),
    enabled: isAuthenticated,
  });

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  useEffect(() => {
    if (isAuthenticated && apiItems.length >= 0) {
      dispatch({ type: "hydrate", ids: apiItems.map((i) => i.productId) });
    }
  }, [isAuthenticated, apiItems]);

  useEffect(() => {
    if (isAuthenticated) return;
    try {
      const raw = localStorage.getItem("kitcerto:favs");
      if (raw) dispatch({ type: "hydrate", ids: JSON.parse(raw) });
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    try {
      localStorage.setItem("kitcerto:favs", JSON.stringify(Array.from(state.ids)));
    } catch {}
  }, [isAuthenticated, state.ids]);

  const isFav = (id: string) => state.ids.has(id);

  const toggle = (id: string) => {
    if (isAuthenticated) {
      if (state.ids.has(id)) {
        removeMutation.mutate(id);
        dispatch({ type: "toggle", id });
      } else {
        addMutation.mutate(id);
        dispatch({ type: "toggle", id });
      }
    } else {
      dispatch({ type: "toggle", id });
    }
  };

  const value: FavoritesContextType = {
    state,
    dispatch,
    isFav,
    toggle,
    isLoading: isAuthenticated ? isLoading : false,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
