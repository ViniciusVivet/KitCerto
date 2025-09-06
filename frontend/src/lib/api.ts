import { apiBaseUrl } from "@/lib/config";

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error("API base URL não configurada (NEXT_PUBLIC_API_BASE_URL)");
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}


