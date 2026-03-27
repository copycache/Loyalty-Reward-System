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

const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: ChartPie,
  },
  {
    title: "Account List",
    icon: BookUser,
    children: [
      { title: "Member List", url: "/admin/member-list" },
      { title: "Customer List", url: "/admin/customer-list" },
    ],
  },
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

export function AppSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {/* Logo placeholder */}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">MLM System</span>
                <span className="truncate text-xs">Administrator</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            {items.map((item, index) => {
              const isParentActive = item.url && pathname === item.url;

              const hasActiveChild = item.children?.some(
                (sub) => pathname === sub.url,
              );

              const isOpen = hasActiveChild || !!openMenus[item.title];

              return (
                <SidebarMenu key={index}>
                  <SidebarMenuItem>
                    {item.children ? (
                      <Collapsible
                        open={isOpen}
                        onOpenChange={(open) => {
                          // Prevent closing if active child
                          if (hasActiveChild) return;

                          setOpenMenus((prev) => ({
                            ...prev,
                            [item.title]: open,
                          }));
                        }}
                      >
                        {/* Trigger */}
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon size={18} />
                            <span className="flex-1 text-left">
                              {item.title}
                            </span>
                            <ChevronDown
                              className="transition-transform group-data-[state=open]:rotate-180"
                              size={16}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        {/* Submenu */}
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((sub, subIndex) => {
                              const isActive = pathname === sub.url;

                              return (
                                <SidebarMenuSubItem key={subIndex}>
                                  <SidebarMenuSubButton asChild>
                                    <Link
                                      href={sub.url}
                                      className={
                                        isActive
                                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                          : ""
                                      }
                                    >
                                      {sub.title}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url!}
                          className={
                            isParentActive
                              ? "bg-sidebar-accent font-semibold"
                              : ""
                          }
                        >
                          <item.icon size={18} />
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {/* Logo placeholder */}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">John Doe</span>
                <span className="truncate text-xs">email@gmail.com</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
