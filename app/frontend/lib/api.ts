const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions {
  method?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  headers?: Record<string, string>;
  token?: string | null;
}

// Custom error class to carry validation errors from Laravel
export class ApiError extends Error {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: Record<string, string[]>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(
      error.hint || error.message || "Request failed",
      res.status,
      error.errors
    );
  }

  // Handle empty responses (e.g. 204 No Content)
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiGet<T = any>(
  endpoint: string,
  token?: string | null
): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET", token });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiPost<T = any>(
  endpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any,
  token?: string | null
): Promise<T> {
  return apiFetch<T>(endpoint, { method: "POST", body, token });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiUpload<T = any>(
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

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(
      error.hint || error.message || "Upload failed",
      res.status,
      error.errors
    );
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export { API_BASE_URL };
