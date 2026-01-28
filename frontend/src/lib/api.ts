import { apiBaseUrl } from "@/lib/config";
import { getToken } from "@/lib/keycloak";

// Função para normalizar URLs e evitar duplicação de /api
function normalizeApiPath(path: string): string {
  // Garante barra inicial
  if (!path.startsWith('/')) path = '/' + path;
  // Colapsa duplicação /api/api/
  path = path.replace(/^\/api\/api\//, '/api/');
  return path;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error("API base URL não configurada (NEXT_PUBLIC_API_BASE_URL)");
  const normalizedPath = normalizeApiPath(path);
  
  try {
    const res = await fetch(`${apiBaseUrl}${normalizedPath}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: getToken() ? `Bearer ${getToken()}` : undefined } as any,
      ...init,
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 401) {
        // Token expirado ou usuário não autenticado
        console.warn("Token inválido/ausente. Iniciando fluxo de login…");
        if (typeof window !== 'undefined') {
          try {
            const { login } = await import('@/lib/keycloak');
            login();
          } catch {
            // fallback suave
            window.location.href = '/';
          }
        }
      }
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    if (res.status === 204) return undefined as unknown as T;
    
    try {
      return res.json();
    } catch {
      return undefined as unknown as T;
    }
  } catch (error) {
    console.error(`Erro na requisição GET ${normalizedPath}:`, error);
    throw error;
  }
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error("API base URL não configurada (NEXT_PUBLIC_API_BASE_URL)");
  const normalizedPath = normalizeApiPath(path);
  
  try {
    const res = await fetch(`${apiBaseUrl}${normalizedPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: getToken() ? `Bearer ${getToken()}` : undefined } as any,
      body: JSON.stringify(body ?? {}),
      ...init,
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 401) {
        console.warn("Token inválido/ausente. Iniciando fluxo de login…");
        if (typeof window !== 'undefined') {
          try {
            const { login } = await import('@/lib/keycloak');
            login();
          } catch {
            window.location.href = '/';
          }
        }
      }
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    if (res.status === 204) return undefined as unknown as T;
    try {
      return await res.json();
    } catch {
      return undefined as unknown as T;
    }
  } catch (error) {
    console.error(`Erro na requisição POST ${normalizedPath}:`, error);
    throw error;
  }
}

export async function apiPut<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error("API base URL não configurada (NEXT_PUBLIC_API_BASE_URL)");
  const normalizedPath = normalizeApiPath(path);
  
  try {
    const res = await fetch(`${apiBaseUrl}${normalizedPath}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: getToken() ? `Bearer ${getToken()}` : undefined } as any,
      body: JSON.stringify(body ?? {}),
      ...init,
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 401) {
        console.warn("Token inválido/ausente. Iniciando fluxo de login…");
        if (typeof window !== 'undefined') {
          try {
            const { login } = await import('@/lib/keycloak');
            login();
          } catch {
            window.location.href = '/';
          }
        }
      }
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    if (res.status === 204) return undefined as unknown as T;
    try {
      return await res.json();
    } catch {
      return undefined as unknown as T;
    }
  } catch (error) {
    console.error(`Erro na requisição PUT ${normalizedPath}:`, error);
    throw error;
  }
}

export async function apiDelete<T = void>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error("API base URL não configurada (NEXT_PUBLIC_API_BASE_URL)");
  const normalizedPath = normalizeApiPath(path);
  
  try {
    const res = await fetch(`${apiBaseUrl}${normalizedPath}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: getToken() ? `Bearer ${getToken()}` : undefined } as any,
      ...init,
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 401) {
        console.warn("Token inválido/ausente. Iniciando fluxo de login…");
        if (typeof window !== 'undefined') {
          try {
            const { login } = await import('@/lib/keycloak');
            login();
          } catch {
            window.location.href = '/';
          }
        }
      }
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    if (res.status === 204) return undefined as unknown as T;
    
    try {
      return (await res.json()) as T;
    } catch {
      return undefined as unknown as T;
    }
  } catch (error) {
    console.error(`Erro na requisição DELETE ${normalizedPath}:`, error);
    throw error;
  }
}


