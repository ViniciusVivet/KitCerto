// Default to API via Nginx when env is missing
export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/$/, "");
export const useMocks = (process.env.NEXT_PUBLIC_USE_MOCKS ?? "false").toLowerCase() === "true";


