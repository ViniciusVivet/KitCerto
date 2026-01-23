function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, "");
  if (trimmed.startsWith("http") && !trimmed.endsWith("/api")) {
    return `${trimmed}/api`;
  }
  return trimmed;
}

// Default to API via Nginx when env is missing
export const apiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || "/api");
export const useMocks = (process.env.NEXT_PUBLIC_USE_MOCKS ?? "false").toLowerCase() === "true";


