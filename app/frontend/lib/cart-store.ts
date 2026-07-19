"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { apiPost } from "@/lib/api";

interface CartItem {
  item_id: number;
  item_sku: string;
  item_price: number;
  item_thumbnail: string;
  item_qty: number;
  item_gc_price: number;
  discounted_price: number;
  subtotal: number;
  encrypt_id?: string;
  currency_abbreviation?: string;
  id?: number;
}

interface CartState {
  items: number[];
  cartItems: CartItem[];
  total: number;
  totalGc: number;
  cartCount: number;
  walletType: "PHP" | "GC";
  isOpen: boolean;

  addToCart: (itemId: number) => void;
  removeFromCart: (itemId: number) => void;
  changeQty: (itemId: number, qty: number) => void;
  setWalletType: (type: "PHP" | "GC") => void;
  loadCart: () => void;
  syncCartItems: () => Promise<void>;
  getTotal: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

const COOKIE_NAME = "items";
const COOKIE_EXPIRY = 30;

function getItemsFromCookie(): number[] {
  try {
    const raw = Cookies.get(COOKIE_NAME);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItemsToCookie(items: number[]) {
  Cookies.set(COOKIE_NAME, JSON.stringify(items), { expires: COOKIE_EXPIRY, path: "/" });
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartItems: [],
  total: 0,
  totalGc: 0,
  cartCount: 0,
  walletType: "PHP",
  isOpen: false,

  addToCart: (itemId: number) => {
    const items = [...get().items, itemId];
    saveItemsToCookie(items);
    set({ items, cartCount: items.length });
    get().syncCartItems();
  },

  removeFromCart: (itemId: number) => {
    const items = get().items.filter((id) => id !== itemId);
    saveItemsToCookie(items);
    set({ items, cartCount: items.length });
    get().syncCartItems();
  },

  changeQty: (itemId: number, qty: number) => {
    if (qty < 1) qty = 1;
    let items = get().items.filter((id) => id !== itemId);
    for (let i = 0; i < qty; i++) {
      items.push(itemId);
    }
    saveItemsToCookie(items);
    set({ items, cartCount: items.length });

    // Update cart items qty locally — use discounted_price consistently
    const cartItems = get().cartItems.map((ci) => {
      if (ci.item_id === itemId) {
        const price = ci.discounted_price || ci.item_price;
        return { ...ci, item_qty: qty, subtotal: price * qty };
      }
      return ci;
    });
    set({ cartItems });
    get().getTotal();
  },

  setWalletType: (type: "PHP" | "GC") => {
    set({ walletType: type });
    get().getTotal();
  },

  loadCart: () => {
    const items = getItemsFromCookie();
    set({ items, cartCount: items.length });
    if (items.length > 0) {
      get().syncCartItems();
    }
  },

  syncCartItems: async () => {
    const items = get().items;
    const uniqueItems = [...new Set(items)];

    if (uniqueItems.length === 0) {
      set({ cartItems: [], total: 0, totalGc: 0, cartCount: 0 });
      return;
    }

    // Build count map once to avoid repeated filter calls
    const countMap: Record<number, number> = {};
    items.forEach((id) => { countMap[id] = (countMap[id] || 0) + 1; });

    try {
      const slotId = typeof window !== "undefined" ? localStorage.getItem("slot_id") : null;
      const branchId = typeof window !== "undefined" ? localStorage.getItem("member_branch_id") : null;

      const response = await apiPost<CartItem[]>(
        "/api/landing/get_cart_items",
        {
          items: uniqueItems,
          slot_id: slotId,
          branch_id: branchId,
        }
      );

      const cartItems = response.map((item) => {
        const qty = countMap[item.item_id] || 1;
        const price = item.discounted_price || item.item_price;
        return {
          ...item,
          item_qty: qty,
          subtotal: price * qty,
        };
      });

      set({ cartItems });
      get().getTotal();
    } catch (error) {
      console.error("Failed to sync cart:", error);
    }
  },

  getTotal: () => {
    const { cartItems, walletType } = get();
    let total = 0;
    let totalGc = 0;

    cartItems.forEach((item) => {
      total += (item.discounted_price || item.item_price) * item.item_qty;
      totalGc += (item.item_gc_price || 0) * item.item_qty;
    });

    set({ total, totalGc });
  },

  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  clearCart: () => {
    Cookies.remove(COOKIE_NAME);
    set({ items: [], cartItems: [], total: 0, totalGc: 0, cartCount: 0 });
  },
}));
