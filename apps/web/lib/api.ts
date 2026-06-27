import type { Pet, HealthRecord } from "@/lib/types";

// Re-export so existing `import { Pet } from '@/lib/api'` call sites keep working.
export type { Pet, HealthRecord, PetMetrics } from "@/lib/types";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export interface ApiError {
  status: number;
  message: string;
}

/**
 * Laravel 422 validation error shape: { message, errors: { field: [msgs] } }.
 * Thrown by the mutating helpers so callers can surface field-level errors.
 */
export interface ValidationError {
  status: number;
  message: string;
  errors: Record<string, string[]>;
}

export function isValidationError(e: unknown): e is ValidationError {
  return (
    typeof e === "object" &&
    e !== null &&
    "errors" in e &&
    typeof (e as ValidationError).errors === "object"
  );
}

/**
 * Server-side read helper. Token is passed explicitly (resolved from the
 * session cookie in the calling Server Component), since Server Components
 * cannot read client storage.
 */
async function apiFetch<T>(
  path: string,
  token: string | null,
  init: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      cache: "no-store", // Disable cache during debugging
    });
  } catch (e) {
    // Handle true network errors (e.g., DNS, ECONNREFUSED)
    const message = e instanceof Error ? e.message : JSON.stringify(e);
    throw { status: 503, message: `Network/fetch error: ${message}` } satisfies ApiError;
  }

  // Handle API-level errors (e.g., 4xx, 5xx)
  if (res.status === 401) {
    throw { status: 401, message: "Unauthenticated" } satisfies ApiError;
  }
  if (!res.ok) {
    const errorBody = await res.text().catch(() => "Could not read error body.");
    const message = `Request failed with status ${res.status}. Body: ${errorBody.substring(0, 300)}`;
    throw { status: res.status, message } satisfies ApiError;
  }

  return res.json() as Promise<T>;
}

/**
 * Mutating fetch helper. Never caches, and parses Laravel validation
 * errors into a structured throw.
 */
async function apiMutate<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  token: string | null,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (res.status === 422) {
    const payload = (await res.json()) as { message?: string; errors?: Record<string, string[]> };
    throw {
      status: 422,
      message: payload.message ?? "The given data was invalid.",
      errors: payload.errors ?? {},
    } satisfies ValidationError;
  }

  if (res.status === 401) {
    throw { status: 401, message: "Unauthenticated" } satisfies ApiError;
  }

  if (!res.ok) {
    throw { status: res.status, message: `Request failed: ${res.status}` } satisfies ApiError;
  }

  // DELETE may return 200 with a null-data envelope; tolerate empty bodies.
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

// ─── Read path ───────────────────────────────────────────────────────────

export const petsApi = {
  list: (token: string | null) =>
    apiFetch<{ data: Pet[]; meta: { total: number } }>("/pets", token),
  get: (id: string, token: string | null) =>
    apiFetch<{ data: Pet }>(`/pets/${id}`, token),
};

export const healthRecordsApi = {
  list: (token: string | null) =>
    apiFetch<{ data: HealthRecord[] }>("/health-records", token),
};

// ─── Write path (mutations) ──────────────────────────────────────────────

export interface CreatePetInput {
  name: string;
  species: "dog" | "cat";
  breed?: string;
  sex?: "male" | "female" | "unknown";
  date_of_birth?: string;
  microchip_number?: string;
}

export interface UpdatePetInput {
  name?: string;
  species?: "dog" | "cat";
  breed?: string;
  sex?: "male" | "female" | "unknown";
  date_of_birth?: string;
  microchip_number?: string;
}

export const petsMutations = {
  create: (input: CreatePetInput, token: string | null) =>
    apiMutate<{ data: Pet }>("/pets", "POST", token, input),
  update: (id: string, input: UpdatePetInput, token: string | null) =>
    apiMutate<{ data: Pet }>(`/pets/${id}`, "PATCH", token, input),
  remove: (id: string, token: string | null) =>
    apiMutate<{ data: null }>(`/pets/${id}`, "DELETE", token),
};

export interface CreateHealthRecordInput {
  pet_id: string;
  record_type:
    | "weight"
    | "vaccination"
    | "examination"
    | "lab_work"
    | "dental"
    | "surgery"
    | "medication"
    | "other";
  weight_kg: number;
  height_cm?: number;
  temperature_c?: number;
  heart_rate_bpm?: number;
  summary: string;
  notes?: string;
  // bmi / bmr_kcal are intentionally absent — the server computes them.
}

export const healthRecordsMutations = {
  create: (input: CreateHealthRecordInput, token: string | null) =>
    apiMutate<{ data: HealthRecord }>("/health-records", "POST", token, input),
};