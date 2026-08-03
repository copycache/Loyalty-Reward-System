"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const ACTIVITY_EVENTS = ["click", "mousemove", "keydown", "scroll", "touchstart"];
const LAST_ACTIVITY_KEY = "lastActivity";
const FORCE_LOGOUT_KEY = "force-logout";

// Auto-logout when user is inactive for 10 minutes
export function useIdleTimeout() {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishLogout = useCallback(() => {
    logout();
    toast.info("You have been logged out due to inactivity.");
    router.push("/auth/login");
  }, [logout, router]);

  const logoutDueToInactivity = useCallback(async () => {
    if (!token) return;
    try {
      await apiPost("/api/logout", {}, token);
    } catch {
      // still log out locally even if server call fails
    }
    finishLogout();
  }, [token, finishLogout]);

  const resetIdleTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    timerRef.current = setTimeout(logoutDueToInactivity, IDLE_TIMEOUT);
  }, [logoutDueToInactivity]);

  useEffect(() => {
    if (!token) return;

    // If the page loads and the user is already idle, log out immediately
    const lastActivity = parseInt(
      localStorage.getItem(LAST_ACTIVITY_KEY) || "0",
      10
    );
    if (lastActivity && Date.now() - lastActivity >= IDLE_TIMEOUT) {
      logoutDueToInactivity();
      return;
    }

    resetIdleTimer();

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    const handleCrossTabLogout = (event: StorageEvent) => {
      if (event.key === FORCE_LOGOUT_KEY) {
        finishLogout();
      }
    };
    window.addEventListener("storage", handleCrossTabLogout);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
      window.removeEventListener("storage", handleCrossTabLogout);
    };
  }, [token, resetIdleTimer, logoutDueToInactivity, finishLogout]);
}
