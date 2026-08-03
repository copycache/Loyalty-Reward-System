// This file handles all communication with the Laravel backend API.
// It provides simple functions you can use in any page or component.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Custom error class for API errors (shows validation messages from Laravel)
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export class ApiTimeoutError extends Error {
  constructor(endpoint: string) {
    super(`Request to ${endpoint} timed out`);
    this.name = "ApiTimeoutError";
  }
}

// Core request function - all other functions use this
async function request<T>(
  endpoint: string,
  method: string,
  body?: unknown,
  token?: string | null,
  timeout?: number
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout ?? DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorData: { message?: string; hint?: string; errors?: Record<string, string[]> } = {};
      try {
        errorData = await response.json();
      } catch {
        // response wasn't JSON, ignore
      }

      throw new ApiError(
        errorData.hint || errorData.message || "Something went wrong",
        response.status,
        errorData.errors
      );
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new ApiTimeoutError(endpoint);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Easy-to-use functions for GET, POST, and file uploads
export function apiGet<T = unknown>(endpoint: string, token?: string | null, timeout?: number): Promise<T> {
  return request<T>(endpoint, "GET", undefined, token, timeout);
}

export function apiPost<T = unknown>(
  endpoint: string,
  body?: unknown,
  token?: string | null,
  timeout?: number
): Promise<T> {
  return request<T>(endpoint, "POST", body, token, timeout);
}

// For file uploads (FormData) - no JSON content-type needed
export async function apiUpload<T = unknown>(
  endpoint: string,
  formData: FormData,
  token?: string | null,
  timeout?: number
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout ?? DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorData: { message?: string; hint?: string; errors?: Record<string, string[]> } = {};
      try {
        errorData = await response.json();
      } catch {
        // response wasn't JSON, ignore
      }

      throw new ApiError(
        errorData.hint || errorData.message || "Upload failed",
        response.status,
        errorData.errors
      );
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new ApiTimeoutError(endpoint);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Normalizes asset URLs returned by the backend.
// Backend rows may hold Angular-style relative paths (e.g.
// "../../../assets/admin/img/noimage.png") that next/image cannot parse.
export function resolveAssetUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("/") || url.startsWith("data:")) return url;
  const assetsMatch = url.match(/(?:\.\.\/)*assets\/(.+)/i);
  if (assetsMatch) return `/${assetsMatch[1]}`;
  return url.replace(/^(\.\.\/)+/, "/");
}

export { API_BASE_URL };
