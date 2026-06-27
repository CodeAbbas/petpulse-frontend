import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";

/**
 * Android emulator maps host machine's localhost to 10.0.2.2.
 * For iOS simulator use http://localhost:8000.
 * For a physical device use the dev machine's LAN IP.
 */
export const API_BASE_URL = "http://172.17.15.142:8000/api/v1";

const TOKEN_KEY = "petpulse_auth_token";

export const tokenStore = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

/**
 * Callback the AuthContext registers so a 401 can force a global logout
 * without api.ts importing React state directly.
 */
let onUnauthorized: (() => void) | null = null;
export const registerUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  timeout: 15000,
});

// Request interceptor — inject the Sanctum bearer token.
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — on 401, clear the token and trigger logout.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await tokenStore.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

// ─── Typed API surface ───────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "vet" | "admin";
}

interface AuthResponse {
  data: { user: AuthUser; token: string };
  meta: { token_type: string };
}

export const authApi = {
  login: async (email: string, password: string, deviceName = "mobile-device") => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
      device_name: deviceName,
    });
    return data.data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    deviceName = "mobile-device",
  ) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      device_name: deviceName,
    });
    return data.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  me: async () => {
    const { data } = await api.get<{ data: { user: AuthUser } }>("/auth/me");
    return data.data.user;
  },
};
// ─── apps/mobile/src/lib/api.ts ─────────────

// ─── APPEND TO apps/mobile/src/lib/api.ts (after the authApi export) ─────

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

interface PetListResponse {
  data: Pet[];
  meta: { total: number };
}

interface PetSingleResponse {
  data: Pet;
}

export const petsApi = {
  list: async (): Promise<Pet[]> => {
    const { data } = await api.get<PetListResponse>("/pets");
    return data.data;
  },

  create: async (input: {
    name: string;
    species: "dog" | "cat";
    breed?: string;
    sex?: "male" | "female" | "unknown";
    date_of_birth?: string;
  }): Promise<Pet> => {
    const { data } = await api.post<PetSingleResponse>("/pets", input);
    return data.data;
  },
};