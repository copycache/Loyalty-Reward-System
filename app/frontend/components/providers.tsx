"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";

export function Providers({ children }: { children: React.ReactNode }) {
  // Hydrate stores from localStorage/cookies on mount (client-side only)
  useEffect(() => {
    const token = localStorage.getItem("auth");
    const authStore = useAuthStore.getState();
    if (token) {
      authStore.setToken(token);
      authStore.loadUser().then(() => {
        const userType = useAuthStore.getState().user?.type;
        // Only load member-specific data for member users
        if (userType !== "admin" && userType !== "cashier") {
          authStore.loadCurrentSlot();
        }
      });
    }
    // Mark hydration complete so layouts know localStorage has been checked
    authStore.setHydrated();
    useCartStore.getState().loadCart();
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
