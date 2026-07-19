"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Member Initialize Page
 * 
 * Mirrors Angular's MemberInitializeComponent.
 * Redirects authenticated members to their dashboard, 
 * or to the login page if not authenticated.
 * Acts as an entry point for `/member` route.
 */
export default function MemberInitializePage() {
  const router = useRouter();
  const { token, user, _hydrated } = useAuthStore();

  useEffect(() => {
    if (!_hydrated) return;

    if (!token) {
      router.replace("/member/login");
      return;
    }

    // Authenticated member → redirect to dashboard
    router.replace("/member/dashboard");
  }, [token, _hydrated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full" />
    </div>
  );
}
