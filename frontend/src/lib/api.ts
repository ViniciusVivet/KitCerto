import { apiBaseUrl } from "@/lib/config";
import { getToken } from "@/lib/keycloak";

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error("API base URL não configurada (NEXT_PUBLIC_API_BASE_URL)");
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: getToken() ? `Bearer ${getToken()}` : undefined } as any,
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error("API base URL não configurada (NEXT_PUBLIC_API_BASE_URL)");
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: getToken() ? `Bearer ${getToken()}` : undefined } as any,
    body: JSON.stringify(body ?? {}),
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error("API base URL não configurada (NEXT_PUBLIC_API_BASE_URL)");
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: getToken() ? `Bearer ${getToken()}` : undefined } as any,
    body: JSON.stringify(body ?? {}),
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiDelete<T = void>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error("API base URL não configurada (NEXT_PUBLIC_API_BASE_URL)");
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: getToken() ? `Bearer ${getToken()}` : undefined } as any,
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  try {
    return (await res.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}


