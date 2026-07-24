// api.ts
// This file handles all communication with our backend (Laravel) API.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// A custom error type so we can show validation messages from Laravel
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

// This is the "core" function. Everything else (get, post, upload) uses this.
async function request<T>(
  endpoint: string,
  method: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  // Build the headers we send with every request
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // If the user is logged in, attach their token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Make the actual network request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // If something went wrong, try to read the error message and throw it
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

  // Some responses have no body (like a 204 No Content)
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// --- Easy-to-use helper functions ---

export function apiGet<T = unknown>(endpoint: string, token?: string | null): Promise<T> {
  return request<T>(endpoint, "GET", undefined, token);
}

export function apiPost<T = unknown>(
  endpoint: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  return request<T>(endpoint, "POST", body, token);
}

// File uploads are a bit different: no JSON headers, and body is FormData
export async function apiUpload<T = unknown>(
  endpoint: string,
  formData: FormData,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData, // browser sets the correct Content-Type automatically
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
}

export { API_BASE_URL };