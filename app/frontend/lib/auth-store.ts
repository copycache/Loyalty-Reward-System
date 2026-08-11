"use client";

import { useState, useEffect } from "react";
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
  [key: string]: unknown;
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

  login: (email: string, password: string) => Promise<User>;
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

const LOCAL_STORAGE_KEYS = ["auth", "type", "member", "slot_id", "is_logged_in"];

function saveSession(userType: string) {
  localStorage.setItem("is_logged_in", "true");
  localStorage.setItem("type", userType);
}

function clearSession() {
  LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

let state: AuthState;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setState(updates: Partial<AuthState>) {
  state = { ...state, ...updates };
  listeners.forEach((listener) => listener());
}

async function login(email: string, password: string): Promise<User> {
  setState({ isLoading: true });

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || err.hint || "Invalid credentials");
    }

    const body = await response.json();
    const user: User = body.user || body;
    const apiToken = body.token || "";

    if (apiToken) {
      localStorage.setItem("auth", apiToken);
    }

    saveSession(user.type);
    setState({
      user,
      userType: user.type,
      token: apiToken || "session_auth",
      isAuthenticated: true,
      isLoading: false,
    });

    const isRegularMember = user.type !== "admin" && user.type !== "cashier";
    if (isRegularMember) {
      try {
        await loadCurrentSlot();
        await loadPlanSettings();
        await loadPlanLabel();
      } catch {
      }
    }

    return user;
  } catch (error) {
    setState({ isLoading: false });
    throw error;
  }
}

async function logout() {
  setState({ isLoading: true });

  try {
    await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch {
  }

  clearSession();
  clear();
  setState({ isLoading: false });
}

function setToken(token: string) {
  localStorage.setItem("auth", token);
  setState({ token, isAuthenticated: true });
}

function setHydrated() {
  setState({ _hydrated: true });
}

async function loadUser() {
  try {
    const user = await apiGet<User>("/api/user_data");
    const storedToken = localStorage.getItem("auth") || "session_auth";
    setState({ user, userType: user.type, token: storedToken, isAuthenticated: true });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clear();
    } else {
      console.error("Failed to load user:", error);
    }
  }
}

async function loadCurrentSlot(slotId?: string | null) {
  const targetSlotId = slotId || localStorage.getItem("slot_id");

  try {
    const slot = await apiPost<CurrentSlot>("/api/current_slot", {
      slot_id: targetSlotId,
    });
    if (slot) {
      localStorage.setItem("slot_id", String(slot.slot_id));
      setState({ currentSlot: slot, moduleSettings: slot.module_settings });
    }
  } catch (error) {
    console.error("Failed to load slot:", error);
  }
}

async function loadPlanSettings() {
  try {
    const planSettings = await apiPost<Record<string, number>>(
      "/api/member/get_plan_settings",
      {}
    );
    setState({ planSettings });
  } catch (error) {
    console.error("Failed to load plan settings:", error);
  }
}

async function loadPlanLabel() {
  try {
    const planLabel = await apiPost<Record<string, string>>(
      "/api/member/get_plan_label",
      {}
    );
    setState({ planLabel });
  } catch (error) {
    console.error("Failed to load plan label:", error);
  }
}

function setSlotId(id: string) {
  localStorage.setItem("slot_id", id);
}

function getSlotId(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("slot_id") : null;
}

function clear() {
  clearSession();
  setState({
    token: null,
    user: null,
    userType: null,
    currentSlot: null,
    moduleSettings: null,
    planSettings: null,
    planLabel: null,
    isAuthenticated: false,
  });
}

state = {
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

  login,
  logout,
  setToken,
  setHydrated,
  loadUser,
  loadCurrentSlot,
  loadPlanSettings,
  loadPlanLabel,
  setSlotId,
  getSlotId,
  clear,
};

export function useAuthStore(): AuthState;
export function useAuthStore<T>(selector: (state: AuthState) => T): T;
export function useAuthStore(selector?: (state: AuthState) => unknown) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribe(() => setTick((tick) => tick + 1));
    return unsubscribe;
  }, []);

  return selector ? selector(state) : state;
}

export namespace useAuthStore {
  export function getState(): AuthState {
    return state;
  }
}
