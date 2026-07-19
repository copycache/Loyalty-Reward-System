"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Layers,
  DollarSign,
  ArrowUpFromLine,
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

interface DashboardFigures {
  member: { all: number; week: number };
  slot: { all: number; week: number };
  sales: { all: string; week: string };
  payout: { all: string; week: string };
  cashin_wallet: { all: string; week: string };
  pending_payout: { all: string; week: string };
  member_wallet: { all: string; week: string };
  total_direct_bonus: { all: string; week: string };
  total_indirect_bonus: { all: string; week: string };
  active_slots: { all: number; week: number };
  inactive_slots: { all: number; week: number };
}

const kpiCards = [
  {
    key: "member",
    label: "Total Members",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "slot",
    label: "Total Slots",
    icon: Layers,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    key: "active_slots",
    label: "Active Slots",
    icon: Activity,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "inactive_slots",
    label: "Inactive Slots",
    icon: TrendingDown,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    key: "sales",
    label: "Total Sales",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "payout",
    label: "Total Payout",
    icon: ArrowUpFromLine,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    key: "pending_payout",
    label: "Pending Payout",
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "member_wallet",
    label: "Member Wallets",
    icon: Wallet,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    key: "total_direct_bonus",
    label: "Direct Bonus",
    icon: TrendingUp,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    key: "total_indirect_bonus",
    label: "Indirect Bonus",
    icon: TrendingUp,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    key: "cashin_wallet",
    label: "Cash In Wallet",
    icon: DollarSign,
    color: "text-lime-600",
    bg: "bg-lime-50",
  },
] as const;

export default function AdminDashboardPage() {
  const { token, user } = useAuthStore();
  const [figures, setFigures] = useState<DashboardFigures | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const data = await apiPost<DashboardFigures>(
          "/api/admin/dashboard_figures",
          {},
          token
        );
        setFigures(data);
      } catch (err) {
        console.error("Failed to load dashboard figures:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const getValue = (
    key: string,
    period: "all" | "week"
  ): string | number => {
    if (!figures) return "—";
    const val = (figures as unknown as Record<string, { all: string | number; week: string | number }>)[key];
    return val?.[period] ?? "—";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Administrator"}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getValue(card.key, "all")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This week:{" "}
                    <span className="font-medium text-foreground">
                      {getValue(card.key, "week")}
                    </span>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && !figures && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Unable to load dashboard data. Please check if the backend server is
            running.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
