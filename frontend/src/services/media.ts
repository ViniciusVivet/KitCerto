import { apiBaseUrl } from "@/lib/config";
import { getToken } from "@/lib/keycloak";

export type MediaItem = { url: string; type: "image" | "video"; fileName: string };

export async function uploadMedia(files: File[]): Promise<MediaItem[]> {
  if (!files.length) return [];
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetch(`${apiBaseUrl}/media/upload`, {
    method: "POST",
    headers: { Authorization: getToken() ? `Bearer ${getToken()}` : "" },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Falha no upload (${res.status})`);
  }

  return res.json();
}
