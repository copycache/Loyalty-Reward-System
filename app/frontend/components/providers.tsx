"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";

export function Providers({ children }: { children: React.ReactNode }) {
  // Hydrate stores from localStorage/cookies on mount (client-side only)
  useEffect(() => {
    const authStore = useAuthStore.getState();
    const isLoggedIn = localStorage.getItem("is_logged_in") === "true";
    if (isLoggedIn) {
      authStore.loadUser().then(() => {
        const userType = useAuthStore.getState().user?.type;
        if (userType !== "admin" && userType !== "cashier") {
          authStore.loadCurrentSlot();
        }
      });
    }
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
