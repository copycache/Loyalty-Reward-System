"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { label: "Profile", href: "/member/settings/profile" },
  { label: "Addresses", href: "/member/settings/addresses" },
  { label: "Password", href: "/member/settings/password" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href}>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                pathname === tab.href
                  ? "bg-green-600 text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
