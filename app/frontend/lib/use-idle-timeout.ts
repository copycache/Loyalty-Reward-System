"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const EVENTS = ["click", "mousemove", "keydown", "scroll", "touchstart"];

/**
 * Hook that monitors user activity and auto-logs out after 10 minutes of inactivity.
 * Mirrors the Angular IdleService behavior including cross-tab sync via localStorage.
 */
export function useIdleTimeout() {
    const router = useRouter();
    const { token, logout } = useAuthStore();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const executeLogout = useCallback(() => {
        logout();
        toast.info("You have been logged out due to inactivity.");
        router.push("/member/login");
    }, [logout, router]);

    const handleInactivity = useCallback(async () => {
        if (!token) return;
        try {
            await apiPost("/api/logout", {}, token);
        } catch {
            // Logout API call may fail, but we still clear local state
        }
        executeLogout();
    }, [token, executeLogout]);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        localStorage.setItem("lastActivity", Date.now().toString());
        timeoutRef.current = setTimeout(() => handleInactivity(), IDLE_TIMEOUT);
    }, [handleInactivity]);

    useEffect(() => {
        if (!token) return;

        // Check if already timed out (e.g., page refresh after long idle)
        const lastActivity = parseInt(localStorage.getItem("lastActivity") || "0", 10);
        if (lastActivity && Date.now() - lastActivity >= IDLE_TIMEOUT) {
            handleInactivity();
            return;
        }

        // Start watching
        localStorage.setItem("lastActivity", Date.now().toString());
        resetTimer();

        const handlers: { event: string; handler: EventListener }[] = [];
        EVENTS.forEach((event) => {
            const handler = () => resetTimer();
            window.addEventListener(event, handler);
            handlers.push({ event, handler });
        });

        // Cross-tab sync: detect force-logout from another tab
        const storageHandler = (e: StorageEvent) => {
            if (e.key === "force-logout") {
                executeLogout();
            }
        };
        window.addEventListener("storage", storageHandler);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            handlers.forEach(({ event, handler }) => {
                window.removeEventListener(event, handler);
            });
            window.removeEventListener("storage", storageHandler);
        };
    }, [token, resetTimer, handleInactivity, executeLogout]);
}
