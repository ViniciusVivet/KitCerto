import { apiGet, apiPatch } from "@/lib/api";
import { apiBaseUrl } from "@/lib/config";
import { getToken } from "@/lib/keycloak";

export type MeProfile = {
  userId: string;
  name?: string | null;
  email?: string | null;
  displayName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  birthDate?: string | null;
  document?: string | null;
  newsletterOptIn: boolean;
  updatedAtUtc?: string | null;
};

export type UpdateProfilePayload = {
  displayName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  birthDate?: string | null;
  document?: string | null;
  newsletterOptIn: boolean;
};

export async function getMe(): Promise<MeProfile> {
  return apiGet<MeProfile>("/me");
}

export async function updateMe(payload: UpdateProfilePayload): Promise<void> {
  return apiPatch<void>("/me", payload);
}

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const path = `${apiBaseUrl}/me/avatar`.replace(/\/api\/api\//, "/api/");
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(path, {
    method: "POST",
    headers: { Authorization: getToken() ? `Bearer ${getToken()}` : "" },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload falhou (${res.status})`);
  }
  return res.json();
}
