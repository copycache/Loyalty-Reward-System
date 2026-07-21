// app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
// import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Bell, ChevronDown, LogOut, UserCircle } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatPath = (path: string): string => {
  const segment = path.replace(/^\/admin\/?/, "");
  if (!segment) return "Dashboard";
  return segment
    .split("/")[0]
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// ─── Layout ─────────────────────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, loadUser, logout, _hydrated } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!_hydrated) return;
    if (!token) {
      router.replace("/member/login");
      return;
    }

    const init = async () => {
      try {
        if (!user) await loadUser();
        const currentUser = useAuthStore.getState().user;
        if (currentUser && currentUser.type !== "admin") {
          router.replace("/member/dashboard");
          return;
        }
      } catch {
        // token may be invalid — silently fail
      }
      setInitialized(true);
    };

    init();
  }, [token, _hydrated]);

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
    router.push("/member/login");
  };

  // ── Loading / auth guard ──
  if (!_hydrated || !token || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const initials = user
    ? `${user.first_name?.[0] || user.name?.[0] || "A"}${
        user.last_name?.[0] || ""
      }`.toUpperCase()
    : "AD";

  const displayName =
    user?.name ||
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    "Admin User";

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={handleLogout} />

      <SidebarInset>
        {/* ── Top Header ── */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          {/* Left: trigger + page title */}
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm font-semibold">
              {formatPath(pathname)}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Theme toggle */}
            {/* <ModeToggle /> */}

            <Separator orientation="vertical" className="h-5 mx-1" />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.photo_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium">
                    {displayName}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}