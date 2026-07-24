"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

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
  { key: "member", label: "Total Members", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "active_slots", label: "Active Slots", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
  { key: "inactive_slots", label: "Inactive Slots", icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
  { key: "sales", label: "Total Sales", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "member_wallet", label: "Member Wallets", icon: Wallet, color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "payout", label: "Total Payout", icon: ArrowUpFromLine, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "pending_payout", label: "Pending Payout", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "total_direct_bonus", label: "Direct Bonus", icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50" },
  { key: "total_indirect_bonus", label: "Indirect Bonus", icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
  { key: "cashin_wallet", label: "Cash In Wallet", icon: DollarSign, color: "text-lime-600", bg: "bg-lime-50" },
] as const;

interface TopEarner {
  profile_picture?: string;
  name: string;
  sum_earn?: number;
  total_directs?: number;
}

interface TopDirect {
  profile_picture?: string;
  name: string;
  total_directs?: number;
}

interface ChartData {
  member?: { columns?: string[][]; rows?: { c: { v: string | number }[] }[] };
  sales?: { columns?: string[][]; rows?: { c: { v: string | number }[] }[] };
}

export default function AdminDashboardPage() {
  const { token, user } = useAuthStore();
  const [figures, setFigures] = useState<DashboardFigures | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberChartData, setMemberChartData] = useState<any[]>([]);
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const [topEarners, setTopEarners] = useState<TopEarner[]>([]);
  const [topEarnersAcc, setTopEarnersAcc] = useState<TopEarner[]>([]);
  const [topDirects, setTopDirects] = useState<TopDirect[]>([]);
  const [earnerFilter, setEarnerFilter] = useState({ date_from: "", date_to: "" });
  const [directFilter, setDirectFilter] = useState({ date_from: "", date_to: "" });

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const data = await apiPost<DashboardFigures>("/api/admin/dashboard_figures", {}, token);
        setFigures(data);
      } catch (err) {
        console.error("Failed to load dashboard figures:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    apiPost<any>("/api/admin/member_chart_data", {}, token).then((res) => {
      if (res?.member?.rows) {
        const rows = res.member.rows.map((r: any) => ({
          label: r.c[0]?.v || "",
          value: parseFloat(r.c[1]?.v as string) || 0,
        }));
        setMemberChartData(rows);
      }
    }).catch(() => {});
    apiPost<any>("/api/admin/sales_chart_data", {}, token).then((res) => {
      if (res?.sales?.rows) {
        const rows = res.sales.rows.map((r: any) => ({
          label: r.c[0]?.v || "",
          value: parseFloat(r.c[1]?.v as string) || 0,
        }));
        setSalesChartData(rows);
      }
    }).catch(() => {});
    loadTopEarners();
    loadTopEarnersAccumulated();
    loadTopDirects();
  }, [token]);

  const loadTopEarners = async (filter?: { date_from?: string; date_to?: string }) => {
    if (!token) return;
    try {
      const data = await apiPost<TopEarner[]>("/api/admin/load_topearner", filter || {}, token);
      setTopEarners(data || []);
    } catch {}
  };

  const loadTopEarnersAccumulated = async () => {
    if (!token) return;
    try {
      const data = await apiPost<TopEarner[]>("/api/admin/load_topearner_accummulated", {}, token);
      setTopEarnersAcc(data || []);
    } catch {}
  };

  const loadTopDirects = async (filter?: { date_from?: string; date_to?: string }) => {
    if (!token) return;
    try {
      const data = await apiPost<TopDirect[]>("/api/admin/load_topdirect", filter || {}, token);
      setTopDirects(data || []);
    } catch {}
  };

  const getValue = (key: string, period: "all" | "week"): string | number => {
    if (!figures) return "—";
    const val = (figures as unknown as Record<string, { all: string | number; week: string | number }>)[key];
    return val?.[period] ?? "—";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "Administrator"}</p>
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getValue(card.key, "all")}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This week: <span className="font-medium text-foreground">{getValue(card.key, "week")}</span>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && (
        <Tabs defaultValue="member_chart">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="member_chart">New Member Chart</TabsTrigger>
            <TabsTrigger value="sales_chart">Sales Chart</TabsTrigger>
            <TabsTrigger value="top_earners">Top 30 Earners (Monthly)</TabsTrigger>
            <TabsTrigger value="top_earners_acc">Top 30 Earners (Accumulated)</TabsTrigger>
            <TabsTrigger value="top_directs">Top 30 Direct (Monthly)</TabsTrigger>
          </TabsList>

          <TabsContent value="member_chart">
            <Card>
              <CardHeader><CardTitle>New Member Chart</CardTitle></CardHeader>
              <CardContent>
                {memberChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={memberChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#820d06" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-10">No data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales_chart">
            <Card>
              <CardHeader><CardTitle>Sales Chart</CardTitle></CardHeader>
              <CardContent>
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#820d06" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-10">No data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top_earners">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>TOP EARNERS - Monthly Top 30 Earners</CardTitle>
                  <div className="flex gap-2">
                    <input type="date" value={earnerFilter.date_from} onChange={(e) => setEarnerFilter(f => ({ ...f, date_from: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                    <input type="date" value={earnerFilter.date_to} onChange={(e) => setEarnerFilter(f => ({ ...f, date_to: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                    <button onClick={() => loadTopEarners(earnerFilter)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Filter</button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {topEarners.map((earner, i) => (
                    <div key={i} className="relative bg-white border rounded-lg p-4 text-center shadow-sm">
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gray-200 mb-2">
                        {earner.profile_picture ? (
                          <img src={earner.profile_picture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                            {earner.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-sm uppercase truncate">{earner.name}</div>
                      <div className="text-primary font-semibold mt-1">
                        PHP {earner.sum_earn ? earner.sum_earn.toFixed(2) : "0.00"}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Income (Month)</div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                  {topEarners.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-10">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top_earners_acc">
            <Card>
              <CardHeader><CardTitle>TOP EARNERS - Accumulated Top 30 Earners</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {topEarnersAcc.map((earner, i) => (
                    <div key={i} className="relative bg-white border rounded-lg p-4 text-center shadow-sm">
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gray-200 mb-2">
                        {earner.profile_picture ? (
                          <img src={earner.profile_picture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                            {earner.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-sm uppercase truncate">{earner.name}</div>
                      <div className="text-primary font-semibold mt-1">
                        PHP {earner.sum_earn ? earner.sum_earn.toFixed(2) : "0.00"}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Overall Income</div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                  {topEarnersAcc.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-10">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top_directs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>TOP DIRECT - Monthly Top 30 Direct</CardTitle>
                  <div className="flex gap-2">
                    <input type="date" value={directFilter.date_from} onChange={(e) => setDirectFilter(f => ({ ...f, date_from: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                    <input type="date" value={directFilter.date_to} onChange={(e) => setDirectFilter(f => ({ ...f, date_to: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                    <button onClick={() => loadTopDirects(directFilter)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Filter</button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {topDirects.map((d, i) => (
                    <div key={i} className="relative bg-white border rounded-lg p-4 text-center shadow-sm">
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gray-200 mb-2">
                        {d.profile_picture ? (
                          <img src={d.profile_picture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                            {d.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-sm uppercase truncate">{d.name}</div>
                      <div className="text-primary font-semibold mt-1 flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" /> {d.total_directs || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Direct(s)</div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                  {topDirects.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-10">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!loading && !figures && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Unable to load dashboard data. Please check if the backend server is running.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
