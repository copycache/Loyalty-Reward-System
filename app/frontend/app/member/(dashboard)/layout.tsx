"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { useIdleTimeout } from "@/lib/use-idle-timeout";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Radio,
  Trophy,
  FileText,
  Award,
  Megaphone,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Lock,
  Network,
  Users,
  Star,
  Gift,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Smartphone,
  BarChart3,
  Play,
} from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleKey?: string; // key in module_settings; item shown when value == 0
  requiresFirstSlot?: boolean; // only show if current slot is the first slot
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
  { title: "Live Stream", href: "/member/live-streaming", icon: Radio, moduleKey: "live_streaming", requiresFirstSlot: true },
  { title: "Leaderboard", href: "/member/leaderboard", icon: Trophy, moduleKey: "leaderboard", requiresFirstSlot: true },
];

const earningsMenu: MenuItem[] = [
  { title: "Transaction Summary", href: "/member/earning", icon: FileText, moduleKey: "earnings" },
  { title: "Marketing Materials", href: "/member/marketing-materials", icon: Megaphone, moduleKey: "ebooks", requiresFirstSlot: true },
];

const financeMenu: MenuItem[] = [
  { title: "Top-up / Cash In", href: "/member/cashin", icon: ArrowDownToLine, moduleKey: "cashin", requiresFirstSlot: true },
  { title: "Withdraw", href: "/member/cashout", icon: ArrowUpFromLine, moduleKey: "cashout", requiresFirstSlot: true },
  { title: "Code & Pin", href: "/member/codevault", icon: Lock, moduleKey: "coadevault" },
];

const networkMenu: MenuItem[] = [
  { title: "Genealogy", href: "/member/genealogy", icon: Network, moduleKey: "mynetwork" },
  { title: "Referrals", href: "/member/sponsor", icon: Users, moduleKey: "leads" },
  { title: "Reward Points", href: "/member/reward-points", icon: Star, moduleKey: "reward_points" },
  { title: "Incentive", href: "/member/incentive", icon: Gift, moduleKey: "incentive" },
];

const shopMenu: MenuItem[] = [
  { title: "E-commerce", href: "/member/shopping", icon: ShoppingCart, moduleKey: "shopping", requiresFirstSlot: true },
  { title: "My Orders", href: "/member/order", icon: Package, moduleKey: "shopping", requiresFirstSlot: true },
];

const otherMenu: MenuItem[] = [
  { title: "E-Loading", href: "/member/e-loading", icon: Smartphone },
  { title: "Survey", href: "/member/survey", icon: BarChart3 },
  { title: "Watch & Earn", href: "/member/watch-video", icon: Play },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, loadUser, loadCurrentSlot, currentSlot, logout, loadPlanSettings, loadPlanLabel, _hydrated } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  // Auto-logout after 10 minutes of inactivity
  useIdleTimeout();

  // Filter menu items based on module_settings and email_verified status
  const isVerified = currentSlot?.email_verified === 1;
  const moduleSettings = currentSlot?.module_settings;
  const isFirstSlot = currentSlot?.slot_id === currentSlot?.first_slot?.slot_id;

  const filterMenu = useMemo(() => {
    return (items: MenuItem[]) =>
      items.filter((item) => {
        // Items without moduleKey are always shown (e.g., Dashboard)
        if (!item.moduleKey) return true;
        // Must be verified and module_settings loaded
        if (!isVerified || !moduleSettings) return false;
        // Module value 0 = enabled (shown), anything else = disabled (hidden)
        if (moduleSettings[item.moduleKey] !== 0) return false;
        // Some items require being on the first (primary) slot
        if (item.requiresFirstSlot && !isFirstSlot) return false;
        return true;
      });
  }, [isVerified, moduleSettings, isFirstSlot]);

  useEffect(() => {
    if (!_hydrated) return; // Wait for localStorage hydration
    if (!token) {
      router.replace("/member/login");
      return;
    }
    const init = async () => {
      try {
        if (!user) await loadUser();
        await loadCurrentSlot();
        await loadPlanSettings();
        await loadPlanLabel();
      } catch {
        // If load fails, token may be invalid
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

  if (!_hydrated || !token || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "??";

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/member/dashboard" className="flex items-center gap-2">
            <img
              src="/images/logo/logo.png"
              alt="Logo"
              className="h-8"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="font-bold text-lg text-green-700">Travel Connect</span>
          </Link>
          {currentSlot && (
            <div className="mt-3 text-xs text-muted-foreground bg-muted rounded px-2 py-1">
              Slot: <span className="font-semibold">{currentSlot.slot_no}</span>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterMenu(menuItems).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Earnings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterMenu(earningsMenu).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Finance</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterMenu(financeMenu).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Network</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterMenu(networkMenu).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Shop</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterMenu(shopMenu).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Other</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterMenu(otherMenu).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/member/settings")}>
                <Link href="/member/settings/profile">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1" />
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photo_url} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm">
                  {user?.first_name} {user?.last_name}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/member/settings/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/member/settings/password">Change Password</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
