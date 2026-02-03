import { apiGet, apiPost, apiDelete } from "@/lib/api";

export type FavoriteItem = {
  productId: string;
  productName?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  createdAtUtc: string;
};

export async function listFavorites(): Promise<FavoriteItem[]> {
  return apiGet<FavoriteItem[]>("/favorites");
}

export async function addFavorite(productId: string): Promise<void> {
  return apiPost<void>(`/favorites/${productId}`, {});
}

export async function removeFavorite(productId: string): Promise<void> {
  return apiDelete(`/favorites/${productId}`);
}
