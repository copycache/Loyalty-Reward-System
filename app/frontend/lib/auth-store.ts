"use client";

import { create } from "zustand";
import { apiPost, apiGet, ApiError, API_BASE_URL } from "@/lib/api";

// --- Types ---
// These describe the shape of data we get back from the API.

interface User {
  id: number;
  name: string;
  email: string;
  type: string; // "admin" | "cashier" | "member" (used to control app behavior)
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
  [key: string]: unknown; // allows extra fields we haven't explicitly listed
}

interface Wallet {
  currency_id: number;
  currency_name: string;
  currency_abbreviation: string;
  currency_buying: number;
  currency_default: number;
  wallet_amount: number;
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
  [key: string]: unknown;
}

// --- The store's shape: what data it holds + what actions it offers ---

interface AuthState {
  // Data
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

  // Actions
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

// --- localStorage helpers ---
// Keeping all localStorage access in one place makes it much easier to
// change later (e.g. if we switch to cookies for security reasons).

const LOCAL_STORAGE_KEYS = ["auth", "type", "member", "slot_id"];

function saveSession(token: string, userType: string) {
  localStorage.setItem("auth", token);
  localStorage.setItem("type", userType);
}

function clearSession() {
  LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

// The "reset to logged-out" version of every piece of state.
// Used by both logout() and clear() so they can't drift out of sync.
const LOGGED_OUT_STATE = {
  token: null,
  user: null,
  userType: null,
  currentSlot: null,
  moduleSettings: null,
  planSettings: null,
  planLabel: null,
  isAuthenticated: false,
};

// --- Login helper ---
// Exchanges an email/password for an access token via Laravel Passport's
// OAuth endpoint. Pulled out of login() because it's a distinct, chunky
// step (its own fetch call, its own error handling).
async function requestAccessToken(
  email: string,
  password: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      grant_type: "password",
      client_id: Number(process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID) || 2,
      client_secret: clientSecret,
      username: email,
      password,
      scope: "",
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.hint || err.message || "Invalid credentials");
  }

  const { access_token: accessToken } = await response.json();
  if (!accessToken) {
    throw new Error("No access token received");
  }

  return accessToken;
}

// --- The store ---

export const useAuthStore = create<AuthState>((set, get) => ({
  // Start everything empty — real values get filled in after hydration
  // on the client, so the server and client render the same thing at first.
  token: null,
  user: null,
  userType: null,
  currentSlot: null,
  moduleSettings: null,
  planSettings: null,
  planLabel: null,
  isLoading: false,
  isAuthenticated: false,
  _hydrated: false,

  // --- Auth actions ---

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      // 1. Get the OAuth client secret, and check the site isn't down for maintenance
      const secretData = await apiGet<{
        oauth: { secret: string };
        maintenance: { mlm_feature_enable: number };
      }>("/api/client_secret");

      if (secretData.maintenance.mlm_feature_enable === 1) {
        throw new Error("Website Under Maintenance.");
      }

      // 2. Trade the email/password for an access token
      const accessToken = await requestAccessToken(
        email,
        password,
        secretData.oauth.secret
      );

      // 3. Use that token to fetch who just logged in
      const user = await apiGet<User>("/api/user_data", accessToken);

      saveSession(accessToken, user.type);
      set({
        token: accessToken,
        user,
        userType: user.type,
        isAuthenticated: true,
        isLoading: false,
      });

      // 4. Regular members also get their slot + plan info loaded right away.
      // Admins/cashiers don't have a "slot", so skip it for them.
      // If any of this fails, we still consider the login itself successful.
      const isRegularMember = user.type !== "admin" && user.type !== "cashier";
      if (isRegularMember) {
        try {
          await get().loadCurrentSlot();
          await get().loadPlanSettings();
          await get().loadPlanLabel();
        } catch {
          // Non-critical — ignore
        }
      }
    } catch (error) {
      set({ isLoading: false });
      throw error; // let the login form show the error message
    }
  },

  logout: async () => {
    const { token } = get();
    set({ isLoading: true });

    // Tell the server to invalidate the token. If this fails (e.g. no
    // internet), we still want to log the user out locally.
    if (token) {
      try {
        await apiPost("/api/logout", {}, token);
      } catch {
        // ignore
      }
    }

    clearSession();
    set({ ...LOGGED_OUT_STATE, isLoading: false });
  },

  setToken: (token) => {
    localStorage.setItem("auth", token);
    set({ token, isAuthenticated: true });
  },

  setHydrated: () => set({ _hydrated: true }),

  // --- Data loading actions ---
  // Fetch the current user's profile. If their token has expired
  // (401 Unauthorized), log them out. Any other error (e.g. a network
  // hiccup) just gets logged, since it isn't necessarily their fault.
  loadUser: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const user = await apiGet<User>("/api/user_data", token);
      set({ user, userType: user.type });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        get().clear();
      } else {
        console.error("Failed to load user:", error);
      }
    }
  },

  loadCurrentSlot: async (slotId) => {
    const { token } = get();
    if (!token) return;

    // Use the slot ID passed in, or fall back to whatever was last used
    const targetSlotId = slotId || localStorage.getItem("slot_id");

    try {
      const slot = await apiPost<CurrentSlot>(
        "/api/current_slot",
        { slot_id: targetSlotId },
        token
      );
      if (slot) {
        localStorage.setItem("slot_id", String(slot.slot_id));
        set({ currentSlot: slot, moduleSettings: slot.module_settings });
      }
    } catch (error) {
      console.error("Failed to load slot:", error);
    }
  },

  loadPlanSettings: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const planSettings = await apiPost<Record<string, number>>(
        "/api/member/get_plan_settings",
        {},
        token
      );
      set({ planSettings });
    } catch (error) {
      console.error("Failed to load plan settings:", error);
    }
  },

  loadPlanLabel: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const planLabel = await apiPost<Record<string, string>>(
        "/api/member/get_plan_label",
        {},
        token
      );
      set({ planLabel });
    } catch (error) {
      console.error("Failed to load plan label:", error);
    }
  },

  // --- Slot ID helpers (just wrap localStorage) ---

  setSlotId: (id) => localStorage.setItem("slot_id", id),

  getSlotId: () =>
    typeof window !== "undefined" ? localStorage.getItem("slot_id") : null,

  // Same end result as logout(), but skips the API call — used when we
  // already know the session is invalid (e.g. a 401 from loadUser).
  clear: () => {
    clearSession();
    set(LOGGED_OUT_STATE);
  },
}));