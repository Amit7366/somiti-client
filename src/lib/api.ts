import type { ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1";
export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");
const TOKEN_KEY = "somiti_token";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${TOKEN_MAX_AGE}; SameSite=Lax`;
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export class ApiRequestError extends Error {
  status: number;
  errors?: { path: string; message: string }[] | null;

  constructor(message: string, status: number, errors?: { path: string; message: string }[] | null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new ApiRequestError(json.message || "Request failed", res.status, json.errors);
  }

  return json;
}

export type UploadedAsset = {
  url: string;
  filename: string;
  publicId?: string;
  transformUrl?: string;
  provider?: "imagelab" | "local";
};

/** Uploads via our API → ImageLab (key stays on the server). */
export async function uploadFile(file: File): Promise<UploadedAsset> {
  const token = getToken();
  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: "include",
    body,
  });

  const json = (await res.json()) as ApiResponse<UploadedAsset>;
  if (!res.ok) {
    throw new ApiRequestError(json.message || "Upload failed", res.status, json.errors);
  }
  return json.data;
}
