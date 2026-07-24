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

/**
 * Watches for user activity (clicks, scrolling, typing, etc.) and
 * automatically logs the user out after IDLE_TIMEOUT of no activity.
 *
 * Also syncs across browser tabs: if the user is logged out in one tab,
 * all other open tabs log out too (via the "storage" event).
 */
export function useIdleTimeout() {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clears local state, shows a toast, and redirects to login.
  // This does NOT call the API — just handles the client-side cleanup.
  const finishLogout = useCallback(() => {
    logout();
    toast.info("You have been logged out due to inactivity.");
    router.push("/member/login");
  }, [logout, router]);

  // Called when the idle timer runs out. Tells the server we're logging
  // out, then cleans up locally regardless of whether that call succeeds.
  const logoutDueToInactivity = useCallback(async () => {
    if (!token) return;

    try {
      await apiPost("/api/logout", {}, token);
    } catch {
      // Even if the server call fails, we still want to log out locally.
    }

    finishLogout();
  }, [token, finishLogout]);

  // Called on every user activity. Records "I was active just now" and
  // restarts the countdown to auto-logout.
  const resetIdleTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    timerRef.current = setTimeout(logoutDueToInactivity, IDLE_TIMEOUT);
  }, [logoutDueToInactivity]);

  useEffect(() => {
    if (!token) return;

    // Edge case: if the user refreshes the page (or reopens the tab)
    // after already being idle for too long, log them out immediately
    // instead of waiting for a new timer to elapse.
    const lastActivity = parseInt(
      localStorage.getItem(LAST_ACTIVITY_KEY) || "0",
      10
    );
    const alreadyIdleTooLong =
      lastActivity && Date.now() - lastActivity >= IDLE_TIMEOUT;

    if (alreadyIdleTooLong) {
      logoutDueToInactivity();
      return;
    }

    // Start tracking activity from now
    resetIdleTimer();

    // Listen for any sign of activity and reset the timer each time
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Listen for a "force-logout" signal from another tab. If this user
    // gets logged out in one tab, every other open tab should follow.
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