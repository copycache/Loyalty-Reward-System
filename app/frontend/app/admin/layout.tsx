"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
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
  Users,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Wallet,
  ArrowUpFromLine,
  ArrowDownToLine,
  BarChart3,
  Network,
  FileText,
  Shield,
} from "lucide-react";

const mainMenu = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
];

const managementMenu = [
  { title: "Members", href: "/admin/members", icon: Users },
  { title: "Slots", href: "/admin/slots", icon: Network },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Products", href: "/admin/products", icon: Package },
];

const financeMenu = [
  { title: "Cash In", href: "/admin/cashin", icon: ArrowDownToLine },
  { title: "Cash Out / Payout", href: "/admin/cashout", icon: ArrowUpFromLine },
  { title: "Wallet", href: "/admin/wallet", icon: Wallet },
];

const reportsMenu = [
  { title: "Reports", href: "/admin/reports", icon: BarChart3 },
  { title: "Audit Trail", href: "/admin/audit", icon: FileText },
];

const settingsMenu = [
  { title: "MLM Plans", href: "/admin/plans", icon: Network },
  { title: "Maintenance", href: "/admin/maintenance", icon: Shield },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

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
    if (!_hydrated) return; // Wait for localStorage hydration
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
        // token may be invalid
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
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const initials = user
    ? `${user.first_name?.[0] || user.name?.[0] || "A"}${user.last_name?.[0] || ""}`.toUpperCase()
    : "AD";

  const renderMenuGroup = (
    items: typeof mainMenu,
    label?: string
  ) => (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
              >
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
  );

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <img
              src="/images/logo/logo.png"
              alt="Logo"
              className="h-8"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <span className="font-bold text-lg text-blue-700">
                Travel Connect
              </span>
              <span className="block text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          {renderMenuGroup(mainMenu)}
          {renderMenuGroup(managementMenu, "Management")}
          {renderMenuGroup(financeMenu, "Finance")}
          {renderMenuGroup(reportsMenu, "Reports")}
          {renderMenuGroup(settingsMenu, "Configuration")}
        </SidebarContent>

        <SidebarFooter className="p-4">
          <SidebarMenu>
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
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm">
                  {user?.name || `${user?.first_name} ${user?.last_name}`}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
