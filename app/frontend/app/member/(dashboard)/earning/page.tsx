"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Loader2, TrendingUp, ChevronLeft, ChevronRight,
  Search, Calendar, Eye, DollarSign, Award,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  API endpoint map — each comp plan has its own earning API          */
/* ------------------------------------------------------------------ */
const EARNING_ENDPOINTS: Record<string, string> = {
  direct: "/api/earning/direct",
  indirect: "/api/earning/indirect",
  binary: "/api/earning/binary",
  unilevel: "/api/earning/unilevel",
  stairstep: "/api/earning/stairstep",
  cashback: "/api/earning/cashback",
  board: "/api/earning/board",
  monoline: "/api/earning/monoline",
  pass_up: "/api/earning/pass_up",
  leveling_bonus: "/api/earning/leveling_bonus",
  unilevel_or: "/api/earning/unilevel_or_earning",
  universal_pool_bonus: "/api/earning/universal_pool_bonus",
  share_link: "/api/earning/share_link",
  watch_earn: "/api/earning/watch_earning",
  global_pool_bonus: "/api/earning/global_pool",
  incentive_bonus: "/api/earning/incentive_bonus",
  leadership_bonus: "/api/earning/leadership_bonus",
  royalty_bonus: "/api/earning/royalty_bonus",
  mentors_bonus: "/api/earning/mentors",
  captcha: "/api/earning/captcha",
  personal_cashback: "/api/earning/personal_cashback",
  retailer_commission: "/api/earning/retailer_commission",
  share_link_v2: "/api/earning/share_link_v2",
  product_share_link: "/api/earning/product_share_link",
  overriding_commission: "/api/earning/overriding_commission",
  product_direct_referral: "/api/earning/product_direct_referral",
  direct_personal_cashback: "/api/earning/direct_personal_cashback",
  product_personal_cashback: "/api/earning/product_personal_cashback",
  team_sales_bonus: "/api/earning/team_sales_bonus",
  retailer_override: "/api/earning/retailer_override",
  reverse_pass_up: "/api/earning/reverse_pass_up",
  achievers_rank: "/api/earning/achievers_rank",
  dropshipping_bonus: "/api/earning/dropshipping_bonus",
  welcome_bonus: "/api/earning/welcome_bonus_earning",
  unilevel_matrix_bonus: "/api/earning/unilevel_matrix_bonus",
  reward_points: "/api/earning/reward_points_earning",
  prime_refund: "/api/earning/prime_refund_earning",
  incentive: "/api/earning/incentive_earning",
  milestone_bonus: "/api/earning/milestone_earning",
  infinity_bonus: "/api/earning/infinity_bonus_earning",
  marketing_support: "/api/earning/marketing_support_earning",
  leaders_support: "/api/earning/leaders_support_earning",
  sponsor_matching: "/api/earning/sponsor_matching",
  direct_gc: "/api/earning/direct_gc",
  direct_bonus: "/api/earning/direct_bonus",
  binary_points: "/api/earning/binary_points",
  binary_slot_limit: "/api/earning/binary_slot_limit",
};

/* Sub-endpoints that load automatically when parent is selected */
const SUB_TABS: Record<string, string[]> = {
  direct: ["direct_bonus", "direct_gc"],
  binary: ["sponsor_matching", "mentors_bonus"],
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function MemberEarningPage() {
  const { token, currentSlot } = useAuthStore();
  const slotId = currentSlot?.slot_id;

  // ---------- Loading ----------
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // ---------- Plan labels (dynamic tabs) ----------
  const [planLabels, setPlanLabels] = useState<any[]>([]);
  const [activeComplan, setActiveComplan] = useState<string>("");
  const [isDynamicCom, setIsDynamicCom] = useState<string>("normal");
  const [totalAmount, setTotalAmount] = useState<any>(null);

  // ---------- Earning data (per tab) ----------
  const [earningData, setEarningData] = useState<any>(null);
  const [subData, setSubData] = useState<Record<string, any>>({});
  const [pageControl, setPageControl] = useState<any>({ page: 1 });

  // ---------- Breakdowns ----------
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState<any>(null);
  const [breakdownTitle, setBreakdownTitle] = useState("");

  // ---------- Date filter (unilevel) ----------
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // ---------- Membership filter ----------
  const [membershipList, setMembershipList] = useState<any[]>([]);
  const [membershipFilter, setMembershipFilter] = useState<string>("all");

  /* ================================================================ */
  /*  Initialization                                                   */
  /* ================================================================ */

  const initialize = useCallback(async () => {
    if (!token || !slotId) return;
    setLoading(true);
    try {
      const [initRes, labelRes, filterRes] = await Promise.all([
        apiPost("/api/member/get_initial", { current_slot_id: slotId }, token).catch(() => null),
        apiPost("/api/member/get_earning/label", {}, token).catch(() => null),
        apiPost("/api/member/get_filters", {}, token).catch(() => null),
      ]);

      if (initRes) {
        setIsDynamicCom(initRes.is_dynamic_com || "normal");
        setTotalAmount(initRes.total);
        if (initRes.initial) {
          setActiveComplan(initRes.initial);
        }
      }
      if (Array.isArray(labelRes)) setPlanLabels(labelRes);
      if (filterRes) setMembershipList(Array.isArray(filterRes) ? filterRes : []);

      // Load initial tab data
      if (initRes?.initial) {
        await loadTabData(initRes.initial, 1);
      }
    } catch { /* ignore */ }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, slotId]);

  useEffect(() => { initialize(); }, [initialize]);

  /* ================================================================ */
  /*  Tab data loading                                                 */
  /* ================================================================ */

  const loadTabData = async (plan: string, page: number, sd?: string, ed?: string) => {
    if (!token || !slotId) return;
    setTabLoading(true);
    setEarningData(null);
    setSubData({});

    const endpoint = EARNING_ENDPOINTS[plan];
    if (!endpoint) {
      // Fallback: generic earning endpoint
      try {
        const res = await apiPost("/api/member/get_earning", {
          plan, page, current_slot_id: slotId,
        }, token);
        setEarningData(res);
      } catch { /* ignore */ }
      setTabLoading(false);
      return;
    }

    const payload: any = { current_slot_id: slotId, page };
    if (plan === "unilevel" || plan === "unilevel_dynamic") {
      if (sd) payload.start_date = sd;
      if (ed) payload.end_date = ed;
    }

    try {
      // Use dynamic endpoint for unilevel if needed
      let actualEndpoint = endpoint;
      if (plan === "unilevel" && isDynamicCom !== "normal") {
        actualEndpoint = "/api/earning/unilevel_dynamic";
      }

      const res = await apiPost(actualEndpoint, payload, token);
      setEarningData(res);

      // Load sub-tabs automatically
      const subs = SUB_TABS[plan];
      if (subs) {
        const subResults: Record<string, any> = {};
        await Promise.all(
          subs.map(async (sub) => {
            const subEndpoint = EARNING_ENDPOINTS[sub];
            if (subEndpoint) {
              try {
                const subRes = await apiPost(subEndpoint, { current_slot_id: slotId }, token);
                subResults[sub] = subRes;
              } catch { /* ignore */ }
            }
          })
        );
        setSubData(subResults);
      }
    } catch { /* ignore */ }
    setTabLoading(false);
  };

  /* ================================================================ */
  /*  Tab selection                                                    */
  /* ================================================================ */

  const handleTabChange = (plan: string) => {
    setActiveComplan(plan);
    setPageControl({ page: 1 });
    setStartDate("");
    setEndDate("");
    loadTabData(plan, 1);
  };

  /* ================================================================ */
  /*  Pagination                                                       */
  /* ================================================================ */

  const goToPage = (page: number) => {
    setPageControl({ page });
    loadTabData(activeComplan, page, startDate, endDate);
  };

  /* ================================================================ */
  /*  Date filter (unilevel)                                           */
  /* ================================================================ */

  const applyDateFilter = () => {
    loadTabData(activeComplan, 1, startDate, endDate);
  };

  /* ================================================================ */
  /*  Level breakdown                                                  */
  /* ================================================================ */

  const viewLevelBreakdown = async (level: number, plan: string) => {
    if (!token || !slotId) return;
    setBreakdownTitle(`Level ${level} Breakdown`);
    setBreakdownData(null);
    setBreakdownOpen(true);
    try {
      const res = await apiPost("/api/member/get_level_item", {
        current_slot_id: slotId,
        level,
        page: 1,
      }, token);
      setBreakdownData(res);
    } catch { /* ignore */ }
  };

  const viewDynamicBreakdown = async (level: number) => {
    if (!token || !slotId || !earningData) return;
    setBreakdownTitle(`Level ${level} Dynamic Breakdown`);
    setBreakdownData(null);
    setBreakdownOpen(true);
    try {
      const res = await apiPost("/api/earning/get_dynamic_breakdown", {
        current_slot_id: slotId,
        level,
        start: earningData.first_date,
        end: earningData.end_date,
      }, token);
      setBreakdownData(res);
    } catch { /* ignore */ }
  };

  /* ================================================================ */
  /*  Helpers                                                          */
  /* ================================================================ */

  const formatCurrency = (val: any) => {
    const num = parseFloat(val) || 0;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  };

  const getPlanLabel = (planCode: string) => {
    const found = planLabels.find((l) => l.plan_code === planCode);
    return found?.plan_name || planCode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Extract paginated data array from various response formats
  const getDataArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.data?.data && Array.isArray(data.data.data)) return data.data.data;
    if (data.log && data.log.data && Array.isArray(data.log.data)) return data.log.data;
    return [];
  };

  const getLastPage = (data: any): number => {
    if (!data) return 1;
    if (data.last_page) return data.last_page;
    if (data.data?.last_page) return data.data.last_page;
    if (data.log?.last_page) return data.log.last_page;
    return 1;
  };

  const getCurrentPage = (data: any): number => {
    if (!data) return 1;
    if (data.current_page) return data.current_page;
    if (data.data?.current_page) return data.data.current_page;
    if (data.log?.current_page) return data.log.current_page;
    return pageControl.page || 1;
  };

  const getTotal = (data: any): number | null => {
    if (!data) return null;
    if (data.total !== undefined) return parseFloat(data.total) || 0;
    if (data.data?.total !== undefined) return parseFloat(data.data.total) || 0;
    return null;
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with total */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6" /> Earnings
        </h1>
        {totalAmount !== null && (
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardContent className="py-3 px-5 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalAmount)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comp plan tabs — dynamically loaded */}
      {planLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {planLabels.map((label: any) => (
            <Button
              key={label.plan_code}
              variant={activeComplan === label.plan_code ? "default" : "outline"}
              size="sm"
              onClick={() => handleTabChange(label.plan_code)}
              className={activeComplan === label.plan_code ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {label.plan_name}
            </Button>
          ))}
        </div>
      )}

      {/* Date filter for unilevel */}
      {(activeComplan === "unilevel" || activeComplan === "unilevel_matrix_bonus") && (
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  className="w-40"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  className="w-40"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button size="sm" onClick={applyDateFilter}>
                <Calendar className="h-3 w-3 mr-1" /> Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earning data table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4" />
            {getPlanLabel(activeComplan)} {activeComplan ? "Log" : "Select a plan"}
          </CardTitle>
          {earningData && getTotal(earningData) !== null && (
            <CardDescription>
              Subtotal: <span className="font-bold text-green-600">{formatCurrency(getTotal(earningData))}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {tabLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : getDataArray(earningData).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {activeComplan ? "No earning records found." : "Please select an earning type above."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>From / Level</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    {(activeComplan === "unilevel" || activeComplan === "stairstep") && (
                      <TableHead>Action</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDataArray(earningData).map((item: any, i: number) => (
                    <TableRow key={item.id || i}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })
                          : item.date || "-"}
                      </TableCell>
                      <TableCell className="text-sm max-w-48 truncate">
                        {item.description || item.remarks || item.detail || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.from_name || item.from_slot_no || item.level
                          ? `${item.from_name || ""} ${item.from_slot_no ? `(${item.from_slot_no})` : ""} ${item.level ? `Lv.${item.level}` : ""}`.trim()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className="text-green-600">{formatCurrency(item.amount || item.total || item.bonus)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          (item.status === "completed" || item.status === "approved" || !item.status)
                            ? "default" : "secondary"
                        }>
                          {item.status || "completed"}
                        </Badge>
                      </TableCell>
                      {(activeComplan === "unilevel" || activeComplan === "stairstep") && (
                        <TableCell>
                          {item.level && (
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => {
                                if (isDynamicCom !== "normal" && activeComplan === "unilevel") {
                                  viewDynamicBreakdown(item.level);
                                } else {
                                  viewLevelBreakdown(item.level, activeComplan);
                                }
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" /> Details
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sub-tab data (e.g. Direct GC, Direct Bonus under Direct) */}
      {Object.keys(subData).length > 0 && Object.entries(subData).map(([key, data]) => {
        const subItems = getDataArray(data);
        if (subItems.length === 0) return null;
        return (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-base">{getPlanLabel(key)}</CardTitle>
              {getTotal(data) !== null && (
                <CardDescription>
                  Subtotal: <span className="font-bold text-green-600">{formatCurrency(getTotal(data))}</span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subItems.slice(0, 10).map((item: any, i: number) => (
                      <TableRow key={item.id || i}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-sm">{item.description || item.remarks || "-"}</TableCell>
                        <TableCell className="text-sm">{item.from_name || item.from_slot_no || "-"}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(item.amount || item.total || item.bonus)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Pagination */}
      {earningData && getLastPage(earningData) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline" size="sm"
            disabled={getCurrentPage(earningData) <= 1}
            onClick={() => goToPage(getCurrentPage(earningData) - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {getCurrentPage(earningData)} of {getLastPage(earningData)}
          </span>
          <Button
            variant="outline" size="sm"
            disabled={getCurrentPage(earningData) >= getLastPage(earningData)}
            onClick={() => goToPage(getCurrentPage(earningData) + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Level breakdown dialog */}
      <Dialog open={breakdownOpen} onOpenChange={setBreakdownOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{breakdownTitle}</DialogTitle>
          </DialogHeader>
          {!breakdownData ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDataArray(breakdownData).map((item: any, i: number) => (
                    <TableRow key={item.id || i}>
                      <TableCell className="text-sm">{item.name || item.from_name || "-"}</TableCell>
                      <TableCell className="text-sm">{item.slot_no || item.from_slot_no || "-"}</TableCell>
                      <TableCell className="text-right text-sm font-semibold text-green-600">
                        {formatCurrency(item.amount || item.total || item.bonus)}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
