const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export interface PetMetrics {
  current_weight_kg: number | null;
  current_bmi: number | null;
  current_bmr_kcal: number | null;
}

export interface Pet {
  id: string;
  name: string;
  species: "dog" | "cat";
  breed: string | null;
  sex: "male" | "female" | "unknown";
  date_of_birth: string | null;
  age_years: number | null;
  microchip_number: string | null;
  metrics: PetMetrics;
  owner: { id: string };
  timestamps: { created_at: string; updated_at: string };
}

export interface HealthRecord {
  id: string;
  record_type: string;
  vitals: {
    weight_kg: number | null;
    height_cm: number | null;
    temperature_c: number | null;
    heart_rate_bpm: number | null;
  };
  computed_metrics: { bmi: number | null; bmr_kcal: number | null };
  summary: string;
  detail: string | null;
  pet: { id: string; name: string | null };
  recorded_by: { id: string | null };
  recorded_at: string;
}

interface ApiError {
  status: number;
  message: string;
}

/**
 * Server-side fetch helper. Token is passed explicitly (resolved from the
 * session/cookie in the calling Server Component), since Server Components
 * cannot read client storage.
 */
async function apiFetch<T>(
  path: string,
  token: string | null,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    // Revalidate every 30s; override per-call as needed.
    next: { revalidate: 30 },
  });

  if (res.status === 401) {
    const err: ApiError = { status: 401, message: "Unauthenticated" };
    throw err;
  }
  if (!res.ok) {
    const err: ApiError = { status: res.status, message: `Request failed: ${res.status}` };
    throw err;
  }

  return res.json() as Promise<T>;
}

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