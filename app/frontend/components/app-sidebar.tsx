// components/app-sidebar.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  ChartPie,
  ChevronDown,
  Settings,
  ShoppingCart,
  SquareStar,
  BookUser,
  Trophy,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MenuItem = {
  title: string;
  icon: React.ElementType;
  url?: string;
  children?: { title: string; url: string }[];
};

const mainMenu: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: ChartPie,
  },
];

const accountMenu: MenuItem[] = [
  {
    title: "Account List",
    icon: BookUser,
    children: [
      { title: "Member List", url: "/admin/member-list" },
      { title: "Customer List", url: "/admin/customer-list" },
    ],
  },
];

const productMenu: MenuItem[] = [
  {
    title: "Products",
    icon: ShoppingCart,
    children: [
      { title: "Products", url: "/admin/products" },
      { title: "Product Category", url: "/admin/product-category" },
      { title: "Plan", url: "/admin/plans" },
    ],
  },
  {
    title: "Achievers Rewards",
    url: "/admin/achievers-rewards",
    icon: Trophy,
  },
  {
    title: "Special Rewards",
    icon: SquareStar,
    children: [
      { title: "Special Rewards", url: "/admin/special-rewards" },
      { title: "Claimed Rewards", url: "/admin/claimed-rewards" },
    ],
  },
  {
    title: "Vouchers",
    url: "/admin/vouchers",
    icon: Trophy,
  },
  {
    title: "Eloading",
    url: "/admin/eloading",
    icon: Trophy,
  },
];

const cashierMenu: MenuItem[] = [
  {
    title: "Cashier",
    icon: Settings,
    children: [
      { title: "Orders", url: "/admin/orders" },
      { title: "Dragon Pay", url: "/admin/dragon-pay" },
      { title: "Orders Approval", url: "/admin/orders-approval" },
      { title: "CashIn Processing", url: "/admin/cashin-processing" },
      { title: "Payout Processing", url: "/admin/payout-processing" },
      { title: "Stock and Branch", url: "/admin/stock-branch" },
    ],
  },
];

const marketingMenu: MenuItem[] = [
  {
    title: "Marketing Plan",
    icon: Settings,
    children: [
      { title: "Plan", url: "/admin/plan" },
      { title: "Unilevel", url: "/admin/unilevel" },
      { title: "Unilevel Or Abella", url: "/admin/unilevel-abella" },
      {
        title: "Distribute Personal Cashback",
        url: "/admin/distribute-personal-cashback",
      },
    ],
  },
  {
    title: "Recompute",
    icon: Settings,
    children: [
      { title: "Leveling Bonus", url: "/admin/leveling-bonus" },
      { title: "Single Binary", url: "/admin/single-binary" },
      { title: "Pass Up", url: "/admin/pass-up" },
      { title: "Membership Upgrade", url: "/admin/membership-upgrade" },
      {
        title: "Distribute Global Pool Bonus",
        url: "/admin/distribute-global-pool-bonus",
      },
    ],
  },
];

const reportsMenu: MenuItem[] = [
  {
    title: "Reports",
    url: "/admin/reports",
    icon: Trophy,
  },
  {
    title: "Maintenance",
    url: "/admin/maintenance",
    icon: Trophy,
  },
];

const settingsMenu: MenuItem[] = [
  {
    title: "Manage Settings",
    url: "/admin/manage-settings",
    icon: Trophy,
  },
  {
    title: "Memberside Settings",
    icon: Settings,
    children: [
      { title: "Announcement", url: "/admin/announcement" },
      { title: "Banner Settings", url: "/admin/banner-settings" },
      {
        title: "Marketing Material Settings",
        url: "/admin/marketing-material-settings",
      },
      { title: "Live Stream", url: "/admin/live-stream" },
      {
        title: "Distribute Global Pool Bonus",
        url: "/admin/distribute-global-pool-bonus",
      },
    ],
  },
  {
    title: "Manage Survey",
    url: "/admin/manage-survey",
    icon: Trophy,
  },
  {
    title: "Admin Settings",
    url: "/admin/admin-settings",
    icon: Trophy,
  },
];

interface MenuGroupProps {
  items: MenuItem[];
  label?: string;
  openMenus: Record<string, boolean>;
  setOpenMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  pathname: string;
}

function MenuGroup({
  items,
  label,
  openMenus,
  setOpenMenus,
  pathname,
}: MenuGroupProps) {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        {items.map((item, index) => {
          const isParentActive = item.url ? pathname === item.url : false;
          const hasActiveChild = item.children?.some(
            (sub) => pathname === sub.url
          );
          const isOpen = hasActiveChild || !!openMenus[item.title];

          return (
            <SidebarMenu key={index}>
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
                      <SidebarMenuButton
                        isActive={!!hasActiveChild}
                        tooltip={item.title}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((sub, subIndex) => {
                          const isActive = pathname === sub.url;
                          return (
                            <SidebarMenuSubItem key={subIndex}>
                              <SidebarMenuSubButton asChild isActive={isActive}>
                                <Link href={sub.url}>{sub.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={isParentActive}
                    tooltip={item.title}
                  >
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
  );
}

interface AppSidebarProps {
  user?: {
    name?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  } | null;
  onLogout?: () => void;
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const initials = user
    ? `${user.first_name?.[0] || user.name?.[0] || "A"}${
        user.last_name?.[0] || ""
      }`.toUpperCase()
    : "AD";

  const displayName =
    user?.name || `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  const menuGroupProps = { openMenus, setOpenMenus, pathname };

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="p-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <img
            src="/member_img/client-resources/logo/logo.png"
            alt="Logo"
            className="h-8"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <MenuGroup items={mainMenu} {...menuGroupProps} />
        <MenuGroup items={accountMenu} label="Accounts" {...menuGroupProps} />
        <MenuGroup items={productMenu} label="Products & Rewards" {...menuGroupProps} />
        <MenuGroup items={cashierMenu} label="Cashier" {...menuGroupProps} />
        <MenuGroup items={marketingMenu} label="Marketing" {...menuGroupProps} />
        <MenuGroup items={reportsMenu} label="Reports" {...menuGroupProps} />
        <MenuGroup items={settingsMenu} label="Settings" {...menuGroupProps} />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4">
        <SidebarMenu>
          {/* User Info */}
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.photo_url} />
                <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {displayName || "Admin User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Administrator
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          {onLogout && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onLogout}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                tooltip="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}