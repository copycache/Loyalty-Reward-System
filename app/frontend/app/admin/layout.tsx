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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  ArrowDownToLine,
  BarChart3,
  Network,
  Shield,
  Megaphone,
  DollarSign,
} from "lucide-react";

const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Member List",
    url: "/admin/member",
    icon: Users,
  },
  {
    title: "Product",
    icon: Package,
    children: [
      { title: "Product", url: "/admin/product", icon: Package },
      { title: "Product Category", url: "/admin/category", icon: Package },
    ],
  },
  {
    title: "Cashier",
    icon: ShoppingCart,
    children: [
      { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
      { title: "Cash In Processing", url: "/admin/cashin", icon: ArrowDownToLine },
      { title: "Payout Processing", url: "/admin/payout", icon: DollarSign },
      { title: "Stockist and Branches", url: "/admin/cashier", icon: Users },
    ],
  },
  {
    title: "Marketing Plan",
    icon: Megaphone,
    children: [
      { title: "All Plan", url: "/admin/marketing", icon: Megaphone },
      { title: "Unilevel", url: "/admin/unilevel", icon: Network },
      { title: "Unilevel Two", url: "/admin/unileveltwo", icon: Network },
    ],
  },
  {
    title: "Reports",
    url: "/admin/report",
    icon: BarChart3,
  },
  {
    title: "Maintenance",
    url: "/admin/maintenance",
    icon: Shield,
  },
  {
    title: "Manage Settings",
    url: "/admin/manage-settings",
    icon: Settings,
  },
  {
    title: "Admin Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loadUser, logout, _hydrated } = useAuthStore();

  const [initialized, setInitialized] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!_hydrated) return;
    const isLoggedIn = localStorage.getItem("is_logged_in") === "true";
    if (!isLoggedIn) {
      router.replace("/auth/login");
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
        // session may be invalid
      }
      setInitialized(true);
    };

    init();
  }, [_hydrated]);

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
    router.push("/auth/login");
  };

  if (!_hydrated || !initialized) {
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

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  {/* Logo placeholder */}
                  <img
                    src="/member_img/client-resources/logo/logo.png"
                    alt="Logo"
                    className="h-8"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Iqon Elite</span>
                  <span className="truncate text-xs">Administrator</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>

            <SidebarGroupContent>
              {items.map((item) => {
                const hasActiveChild = item.children?.some(
                  (child) => pathname === child.url
                );

                const isParentActive = pathname === item.url;

                const isOpen = hasActiveChild || !!openMenus[item.title];

                return (
                  <SidebarMenu key={item.title}>
                    <SidebarMenuItem>
                      {item.children ? (
                        <Collapsible
                          open={isOpen}
                          onOpenChange={(open) => {
                            if (hasActiveChild) return;
                            setOpenMenus((prev) => ({
                              ...prev,
                              [item.title]: open,
                            }));
                          }}
                        >
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              <item.icon className="h-4 w-4" />
                              <span className="flex-1">{item.title}</span>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.url}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === child.url}
                                  >
                                    <Link href={child.url} className="flex items-center">
                                      {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                                      <span>{child.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton asChild isActive={isParentActive}>
                          <Link href={item.url!}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  </SidebarMenu>
                );
              })}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        {/* <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Administrator</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter> */}
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            {/* <Separator orientation="vertical" className="h-5" />
            <span className="text-sm font-semibold">
              {formatPath(pathname)}
            </span> */}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
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
                    {/* {displayName} */}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  {/* <p className="text-sm font-medium">{displayName}</p> */}
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
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

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}