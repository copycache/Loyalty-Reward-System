"use client";

import { create } from "zustand";
import { apiPost, apiGet, ApiError, API_BASE_URL } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  type: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  mobile_number?: string;
  birthday?: string;
  gender?: string;
  country?: string;
  avatar?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface CurrentSlot {
  slot_id: number;
  slot_no: string;
  slot_count: number;
  slot_owner: number;
  slot_type: string;
  slot_sponsor_code: string;
  slot_sponsored: string;
  slot_encrypted: string;
  slot_id_number: string;
  slot_membership: number;
  membership_name: string;
  sponsor_name: string;
  slot_count_id: number;
  registered_as_retailer: number;
  replicated_sponsoring: number;
  accumulated_earnings: number;
  direct_bonus: number;
  binary_wallet: number;
  indirect_bonus: number;
  rebates: number;
  cd_wallet: number;
  hierarchy: number;
  slot_date_placed: string;
  binary_projected_income_wallet: number;
  gc_binary_wallet: number;
  email_verified: number;
  module_settings: Record<string, number>;
  get_wallets: Wallet[];
  first_slot: { slot_id: number };
  binary_settings: {
    binary_extreme_position: number;
    gc_pairing_count: number;
    binary_auto_placement_based_on_direct: boolean;
  };
  binary_realtime_commission: number;
  mentors_level: number;
  rank_name?: string;
  rank_id?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface Wallet {
  currency_id: number;
  currency_name: string;
  currency_abbreviation: string;
  currency_buying: number;
  currency_default: number;
  wallet_amount: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  userType: string | null;
  currentSlot: CurrentSlot | null;
  moduleSettings: Record<string, number> | null;
  planSettings: Record<string, number> | null;
  planLabel: Record<string, string> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  _hydrated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  setHydrated: () => void;
  loadUser: () => Promise<void>;
  loadCurrentSlot: (slotId?: string | null) => Promise<void>;
  loadPlanSettings: () => Promise<void>;
  loadPlanLabel: () => Promise<void>;
  setSlotId: (id: string) => void;
  getSlotId: () => string | null;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initialize as null to avoid SSR hydration mismatch — hydrate in Providers
  token: null,
  user: null,
  userType: null,
  _hydrated: false,
  currentSlot: null,
  moduleSettings: null,
  planSettings: null,
  planLabel: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Get client secret
      const secretData = await apiGet<{
        oauth: { secret: string };
        maintenance: { mlm_feature_enable: number };
      }>("/api/client_secret");

      if (secretData.maintenance.mlm_feature_enable === 1) {
        throw new Error("Website Under Maintenance.");
      }

      // Get access token
      const tokenData = await fetch(`${API_BASE_URL}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          grant_type: "password",
          client_id: Number(process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID) || 2,
          client_secret: secretData.oauth.secret,
          username: email,
          password: password,
          scope: "",
        }),
      });

      if (!tokenData.ok) {
        const err = await tokenData.json();
        throw new Error(err.hint || err.message || "Invalid credentials");
      }

      const tokenResult = await tokenData.json();
      const accessToken = tokenResult.access_token;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      localStorage.setItem("auth", accessToken);

      // Get user data
      const userData = await apiGet<User>("/api/user_data", accessToken);

      localStorage.setItem("type", userData.type);

      set({
        token: accessToken,
        user: userData,
        userType: userData.type,
        isAuthenticated: true,
        isLoading: false,
      });

      // Auto-load slot and plan data after login (member users only)
      if (userData.type !== "admin" && userData.type !== "cashier") {
        try {
          await get().loadCurrentSlot();
          await get().loadPlanSettings();
          await get().loadPlanLabel();
        } catch {
          // Non-critical — don't block login
        }
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const { token } = get();
    set({ isLoading: true });
    try {
      if (token) {
        await apiPost("/api/logout", {}, token);
      }
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem("auth");
    localStorage.removeItem("type");
    localStorage.removeItem("member");
    localStorage.removeItem("slot_id");
    set({
      token: null,
      user: null,
      userType: null,
      currentSlot: null,
      moduleSettings: null,
      planSettings: null,
      planLabel: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setToken: (token: string) => {
    localStorage.setItem("auth", token);
    set({ token, isAuthenticated: true });
  },

  setHydrated: () => {
    set({ _hydrated: true });
  },

  loadUser: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const userData = await apiGet<User>("/api/user_data", token);
      set({ user: userData, userType: userData.type });
    } catch (error) {
      // Only clear auth on 401 Unauthorized, not on network errors
      if (error instanceof ApiError && error.status === 401) {
        get().clear();
      } else {
        console.error("Failed to load user:", error);
      }
    }
  },

  loadCurrentSlot: async (slotId?: string | null) => {
    const { token } = get();
    if (!token) return;
    const sid = slotId || localStorage.getItem("slot_id");
    try {
      const data = await apiPost<CurrentSlot>(
        "/api/current_slot",
        { slot_id: sid },
        token
      );
      if (data) {
        localStorage.setItem("slot_id", String(data.slot_id));
        set({
          currentSlot: data,
          moduleSettings: data.module_settings,
        });
      }
    } catch (error) {
      console.error("Failed to load slot:", error);
    }
  },

  loadPlanSettings: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const data = await apiPost<Record<string, number>>(
        "/api/member/get_plan_settings",
        {},
        token
      );
      set({ planSettings: data });
    } catch (error) {
      console.error("Failed to load plan settings:", error);
    }
  },

  loadPlanLabel: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const data = await apiPost<Record<string, string>>(
        "/api/member/get_plan_label",
        {},
        token
      );
      set({ planLabel: data });
    } catch (error) {
      console.error("Failed to load plan label:", error);
    }
  },

  setSlotId: (id: string) => {
    localStorage.setItem("slot_id", id);
  },

  getSlotId: () => {
    return typeof window !== "undefined"
      ? localStorage.getItem("slot_id")
      : null;
  },

  clear: () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("type");
    localStorage.removeItem("member");
    localStorage.removeItem("slot_id");
    set({
      token: null,
      user: null,
      userType: null,
      currentSlot: null,
      moduleSettings: null,
      planSettings: null,
      planLabel: null,
      isAuthenticated: false,
    });
  },
}));
