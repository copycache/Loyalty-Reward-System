"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { apiPost } from "@/lib/api";

// --- Types ---

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

// --- Cookie helpers ---
// The cart is stored as a flat array of item IDs, where duplicates mean
// higher quantity. e.g. [5, 5, 7] = 2x item 5, 1x item 7.

const COOKIE_NAME = "items";
const COOKIE_EXPIRY_DAYS = 30;

function getItemsFromCookie(): number[] {
  try {
    const raw = Cookies.get(COOKIE_NAME);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItemsToCookie(items: number[]) {
  Cookies.set(COOKIE_NAME, JSON.stringify(items), {
    expires: COOKIE_EXPIRY_DAYS,
    path: "/",
  });
}

// Counts how many times each item ID appears in the flat array,
// e.g. [5, 5, 7] -> { 5: 2, 7: 1 }
function countItems(items: number[]): Record<number, number> {
  const counts: Record<number, number> = {};
  items.forEach((id) => {
    counts[id] = (counts[id] || 0) + 1;
  });
  return counts;
}

// --- The store ---

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartItems: [],
  total: 0,
  totalGc: 0,
  cartCount: 0,
  walletType: "PHP",
  isOpen: false,

  addToCart: (itemId) => {
    const items = [...get().items, itemId];
    saveItemsToCookie(items);
    set({ items, cartCount: items.length });
    get().syncCartItems();
  },

  removeFromCart: (itemId) => {
    const items = get().items.filter((id) => id !== itemId);
    saveItemsToCookie(items);
    set({ items, cartCount: items.length });
    get().syncCartItems();
  },

  changeQty: (itemId, qty) => {
    // Quantity can't go below 1 — if the user wants 0, they should
    // use removeFromCart instead.
    const safeQty = Math.max(1, qty);

    // Rebuild the flat items array: remove all copies of this item,
    // then add back exactly `safeQty` copies.
    const otherItems = get().items.filter((id) => id !== itemId);
    const items = [...otherItems, ...Array(safeQty).fill(itemId)];

    saveItemsToCookie(items);
    set({ items, cartCount: items.length });

    // Update this item's quantity and subtotal locally, without
    // waiting for a server round-trip (syncCartItems isn't called here).
    const cartItems = get().cartItems.map((cartItem) => {
      if (cartItem.item_id !== itemId) return cartItem;

      const price = cartItem.discounted_price || cartItem.item_price;
      return { ...cartItem, item_qty: safeQty, subtotal: price * safeQty };
    });

    set({ cartItems });
    get().getTotal();
  },

  setWalletType: (type) => {
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

  // Fetches full item details (price, thumbnail, etc.) from the server
  // for the item IDs we have stored, then merges in the quantities.
  syncCartItems: async () => {
    const { items } = get();
    const uniqueItemIds = [...new Set(items)];

    // Nothing in the cart — reset everything and skip the API call.
    if (uniqueItemIds.length === 0) {
      set({ cartItems: [], total: 0, totalGc: 0, cartCount: 0 });
      return;
    }

    const quantities = countItems(items);

    try {
      const slotId =
        typeof window !== "undefined" ? localStorage.getItem("slot_id") : null;
      const branchId =
        typeof window !== "undefined"
          ? localStorage.getItem("member_branch_id")
          : null;

      const serverItems = await apiPost<CartItem[]>(
        "/api/landing/get_cart_items",
        { items: uniqueItemIds, slot_id: slotId, branch_id: branchId }
      );

      const cartItems = serverItems.map((item) => {
        const qty = quantities[item.item_id] || 1;
        const price = item.discounted_price || item.item_price;
        return { ...item, item_qty: qty, subtotal: price * qty };
      });

      set({ cartItems });
      get().getTotal();
    } catch (error) {
      console.error("Failed to sync cart:", error);
    }
  },

  // Recalculates the total price across all cart items, in both
  // regular currency (total) and GC points (totalGc).
  getTotal: () => {
    const { cartItems } = get();

    let total = 0;
    let totalGc = 0;

    cartItems.forEach((item) => {
      const price = item.discounted_price || item.item_price;
      total += price * item.item_qty;
      totalGc += (item.item_gc_price || 0) * item.item_qty;
    });

    set({ total, totalGc });
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  clearCart: () => {
    Cookies.remove(COOKIE_NAME);
    set({ items: [], cartItems: [], total: 0, totalGc: 0, cartCount: 0 });
  },
}));