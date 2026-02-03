import { apiGet, apiPut } from "@/lib/api";

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  freeShippingThreshold: number;
  promoBannerActive: boolean;
  promoBannerText: string;
  maintenanceMode: boolean;
};

export async function getSettings(): Promise<StoreSettings> {
  return apiGet<StoreSettings>(`/settings`);
}

export async function updateSettings(settings: StoreSettings): Promise<void> {
  return apiPut<void>(`/settings`, settings);
}
