"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, TrendingUp, ChevronLeft, ChevronRight,
  Calendar, Eye, DollarSign, Award, Users, Network, Layers, Gift,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

const EARNING_ENDPOINTS: Record<string, string> = {
  direct: "/api/earning/direct",
  indirect: "/api/earning/indirect",
  binary: "/api/earning/binary",
  unilevel: "/api/earning/unilevel",
  mentors_bonus: "/api/earning/mentors",
  dropshipping_bonus: "/api/earning/dropshipping_bonus",
  welcome_bonus: "/api/earning/welcome_bonus_earning",
  direct_bonus: "/api/earning/direct_bonus",
  direct_gc: "/api/earning/direct_gc",
  sponsor_matching: "/api/earning/sponsor_matching",
  binary_points: "/api/earning/binary_points",
  binary_slot_limit: "/api/earning/binary_slot_limit",
};

const PLAN_ICONS: Record<string, string> = {
  DIRECT: "/front/img/earnings-direct.png",
  INDIRECT: "/front/img/earnings-indirect.png",
  BINARY: "/front/img/earnings-matching-commission.png",
  UNILEVEL: "/front/img/earnings-product-unilevel.png",
  MENTORS_BONUS: "/front/img/earnings-mentors.png",
  DROPSHIPPING_BONUS: "/member_img/earnings/DropshippingBonus.jpg",
  WELCOME_BONUS: "/member_img/earnings/WelcomeBonus.png",
};

const ICONS: Record<string, any> = {
  DIRECT: Users,
  INDIRECT: Layers,
  BINARY: Network,
  UNILEVEL: Award,
  MENTORS_BONUS: Gift,
  DROPSHIPPING_BONUS: TrendingUp,
  WELCOME_BONUS: Gift,
};

export default function MemberEarningPage() {
  const { token, currentSlot } = useAuthStore();
  const slotId = currentSlot?.slot_id;

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [planLabels, setPlanLabels] = useState<any[]>([]);
  const [planStatus, setPlanStatus] = useState<Record<string, number>>({});
  const [activeComplan, setActiveComplan] = useState<string>("");
  const [totalAmounts, setTotalAmounts] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>({});
  const [membershipList, setMembershipList] = useState<any[]>([]);

  // Per-plan data
  const [directLog, setDirectLog] = useState<any>(null);
  const [indirectLog, setIndirectLog] = useState<any>(null);
  const [binaryLog, setBinaryLog] = useState<any>(null);
  const [unilevelLog, setUnilevelLog] = useState<any>(null);
  const [mentorsBonusLog, setMentorsBonusLog] = useState<any>(null);
  const [dropshippingLog, setDropshippingLog] = useState<any>(null);
  const [welcomeBonusLog, setWelcomeBonusLog] = useState<any>(null);
  const [directBonusLog, setDirectBonusLog] = useState<any>(null);
  const [directGcLog, setDirectGcLog] = useState<any>(null);
  const [sponsorMatchingLog, setSponsorMatchingLog] = useState<any>(null);
  const [binaryPointsLog, setBinaryPointsLog] = useState<any>(null);
  const [binarySlotLimitLog, setBinarySlotLimitLog] = useState<any>(null);

  // Pagination
  const [pageMap, setPageMap] = useState<Record<string, number>>({});

  // Binary sub-tab
  const [binarySubTab, setBinarySubTab] = useState("full");

  // Unilevel date filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Breakdown dialog
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState<any>(null);
  const [breakdownTitle, setBreakdownTitle] = useState("");

  const formatCurrency = (val: any) => {
    const num = parseFloat(val) || 0;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  };

  const getPlanLabel = (planCode: string) => {
    const found = planLabels.find((l) => l.plan_code === planCode);
    return found?.plan_name || planCode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getPage = (key: string) => pageMap[key] || 1;

  const setPage = (key: string, p: number) => setPageMap((prev) => ({ ...prev, [key]: p }));

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

  const getTotal = (data: any): number | null => {
    if (!data) return null;
    if (data.total !== undefined) return parseFloat(data.total) || 0;
    if (data.data?.total !== undefined) return parseFloat(data.data.total) || 0;
    if (data.total_running !== undefined) return parseFloat(data.total_running) || 0;
    return null;
  };

  const loadPlanData = useCallback(async (plan: string, page: number) => {
    if (!token || !slotId) return;
    setTabLoading(true);

    const payload: any = { current_slot_id: slotId, page };
    const endpoint = EARNING_ENDPOINTS[plan];

    try {
      const res = await apiPost(endpoint || "/api/member/get_earning", {
        ...payload, plan,
      }, token);

      switch (plan) {
        case "direct": setDirectLog(res); break;
        case "indirect": setIndirectLog(res); break;
        case "binary": setBinaryLog(res); break;
        case "unilevel": setUnilevelLog(res); break;
        case "mentors_bonus": setMentorsBonusLog(res); break;
        case "dropshipping_bonus": setDropshippingLog(res); break;
        case "welcome_bonus": setWelcomeBonusLog(res); break;
      }
    } catch { /* ignore */ }

    // Load sub-data
    if (plan === "direct") {
      try {
        const [db, dg] = await Promise.all([
          apiPost(EARNING_ENDPOINTS.direct_bonus, { current_slot_id: slotId }, token),
          apiPost(EARNING_ENDPOINTS.direct_gc, { current_slot_id: slotId }, token),
        ]);
        setDirectBonusLog(db);
        setDirectGcLog(dg);
      } catch { /* ignore */ }
    }

    if (plan === "binary") {
      try {
        const [sm, mb] = await Promise.all([
          apiPost(EARNING_ENDPOINTS.sponsor_matching, { current_slot_id: slotId }, token),
          apiPost(EARNING_ENDPOINTS.mentors_bonus, { current_slot_id: slotId }, token),
        ]);
        setSponsorMatchingLog(sm);
        setMentorsBonusLog(mb);
      } catch { /* ignore */ }
    }

    setTabLoading(false);
  }, [token, slotId]);

  const initialize = useCallback(async () => {
    if (!token || !slotId) return;
    setLoading(true);
    try {
      const [initRes, labelRes, userRes] = await Promise.all([
        apiPost("/api/member/get_initial", { current_slot_id: slotId }, token),
        apiPost("/api/member/get_earning/label", {}, token),
        apiPost("/api/member/get_user_info", { current_slot_id: slotId }, token),
      ]);

      const init = initRes as any;
      if (init) {
        setTotalAmounts(init.total);
        if (init.initial) {
          setActiveComplan(init.initial);
          setPageMap({ [init.initial]: 1 });
        }
      }
      if (Array.isArray(labelRes)) setPlanLabels(labelRes);
      if (userRes) setUserInfo(userRes as any);

      // Get plan status from slot
      if (currentSlot) {
        const cs = currentSlot as any;
        const ps: Record<string, number> = {};
        const planCodes = ["DIRECT", "INDIRECT", "BINARY", "UNILEVEL", "DROPSHIPPING_BONUS", "WELCOME_BONUS"];
        planCodes.forEach((code) => {
          ps[code] = cs[`show_${code.toLowerCase()}`] !== undefined
            ? cs[`show_${code.toLowerCase()}`]
            : 1;
        });
        setPlanStatus(ps);

        // mentors bonus status
        if (cs.mentors_bonus_status !== undefined) {
          ps.MENTORS_BONUS = cs.mentors_bonus_status;
          setPlanStatus({ ...ps });
        }
      }

      // Load initial tab data
      if (init?.initial) {
        await loadPlanData(init.initial, 1);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [token, slotId, currentSlot, loadPlanData]);

  useEffect(() => { initialize(); }, [initialize]);

  const handleTabChange = (plan: string) => {
    setActiveComplan(plan);
    setStartDate("");
    setEndDate("");
    setPageMap({ [plan]: 1 });
    loadPlanData(plan, 1);
  };

  const goToPage = (plan: string, p: number) => {
    setPage(plan, p);
    loadPlanData(plan, p);
  };

  const viewLevelBreakdown = async (level: number) => {
    if (!token || !slotId) return;
    setBreakdownTitle(`Level ${level} Breakdown`);
    setBreakdownData(null);
    setBreakdownOpen(true);
    try {
      const res = await apiPost("/api/member/get_level_item", {
        current_slot_id: slotId, level, page: 1,
      }, token);
      setBreakdownData(res);
    } catch { /* ignore */ }
  };

  const formatDateTime = (dt: string) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatDate = (dt: string) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const activePlanCode = activeComplan?.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6" /> Earnings
        </h1>
      </div>

      {/* Plan cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {planLabels.map((label: any) => {
          const code = label.plan_code;
          if (planStatus[code] === 0) return null;
          if (code === "UNILEVEL" && currentSlot?.show_unilevel !== 1) return null;
          const totalVal = totalAmounts?.[code];
          const IconComp = ICONS[code] || Award;
          const imgSrc = PLAN_ICONS[code];

          return (
            <div
              key={code}
              className={`border rounded-xl p-4 cursor-pointer transition-all text-center ${
                activeComplan === code
                  ? "border-green-500 bg-green-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleTabChange(code)}
            >
              <div className="flex justify-center mb-2">
                {imgSrc ? (
                  <img src={imgSrc} alt="" className="w-10 h-10 object-contain" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "block";
                  }} />
                ) : null}
                <IconComp className={`w-8 h-8 ${imgSrc ? "hidden" : ""} text-muted-foreground`} />
              </div>
              <div className="text-sm font-medium truncate">{label.plan_name}</div>
              {totalVal !== undefined && (
                <div className="text-xs font-bold text-green-600 mt-1">{totalVal}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Plan-specific content */}
      {activeComplan && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4" />
              Earnings Summary for {getPlanLabel(activeComplan)}
            </CardTitle>
          </CardHeader>

          {/* DIRECT */}
          {activeComplan === "DIRECT" && (
            <CardContent className="p-0">
              {renderDirectTable()}
            </CardContent>
          )}

          {/* INDIRECT */}
          {activeComplan === "INDIRECT" && (
            <CardContent className="p-0">
              {renderIndirectTable()}
            </CardContent>
          )}

          {/* BINARY */}
          {activeComplan === "BINARY" && (
            <CardContent className="p-0">
              {renderBinaryContent()}
            </CardContent>
          )}

          {/* UNILEVEL */}
          {activeComplan === "UNILEVEL" && (
            <CardContent className="p-0">
              {renderUnilevelContent()}
            </CardContent>
          )}

          {/* MENTORS BONUS */}
          {activeComplan === "MENTORS_BONUS" && (
            <CardContent className="p-0">
              {renderSimpleTable(
                mentorsBonusLog,
                "mentors_bonus",
                ["Date", "Time", "Owner", "Username", "Membership", "Earning"],
                (item: any) => (
                  <>
                    <TableCell>{item.earning_log_date_created || formatDate(item.created_at)}</TableCell>
                    <TableCell>{item.earning_log_time_created || "—"}</TableCell>
                    <TableCell>{item.first_name} {item.last_name}</TableCell>
                    <TableCell>{item.slot_no}</TableCell>
                    <TableCell>{item.membership_name}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(item.earning_log_amount)}</TableCell>
                  </>
                )
              )}
            </CardContent>
          )}

          {/* DROPSHIPPING BONUS */}
          {activeComplan === "DROPSHIPPING_BONUS" && (
            <CardContent className="p-0">
              {renderSimpleTable(
                dropshippingLog,
                "dropshipping_bonus",
                ["Date", "Time", "Owner", "Username", "Membership", "Earning"],
                (item: any) => (
                  <>
                    <TableCell>{item.earning_log_date_created || formatDate(item.created_at)}</TableCell>
                    <TableCell>{item.earning_log_time_created || "—"}</TableCell>
                    <TableCell>{item.first_name} {item.last_name}</TableCell>
                    <TableCell>{item.slot_no}</TableCell>
                    <TableCell>{item.membership_name}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(item.earning_log_amount)}</TableCell>
                  </>
                )
              )}
            </CardContent>
          )}

          {/* WELCOME BONUS */}
          {activeComplan === "WELCOME_BONUS" && (
            <CardContent className="p-0">
              {renderSimpleTable(
                welcomeBonusLog,
                "welcome_bonus",
                ["Date", "Time", "Owner", "Username", "Membership", "Earning"],
                (item: any) => (
                  <>
                    <TableCell>{item.earning_log_date_created || formatDate(item.created_at)}</TableCell>
                    <TableCell>{item.earning_log_time_created || "—"}</TableCell>
                    <TableCell>{item.first_name} {item.last_name}</TableCell>
                    <TableCell>{item.slot_no}</TableCell>
                    <TableCell>{item.membership_name}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(item.earning_log_amount)}</TableCell>
                  </>
                )
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Level Breakdown Dialog */}
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
                      <TableCell>{item.name || item.from_name || "-"}</TableCell>
                      <TableCell>{item.slot_no || item.from_slot_no || "-"}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{formatCurrency(item.amount || item.total || item.bonus)}</TableCell>
                      <TableCell>{item.created_at ? formatDate(item.created_at) : "-"}</TableCell>
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

  // ---- Render helpers ----

  function renderDirectTable() {
    const items = getDataArray(directLog);
    return (
      <div className="space-y-6 p-0">
        {/* Direct table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-center">Owner</TableHead>
                <TableHead className="text-center">Username</TableHead>
                <TableHead className="text-center">Membership</TableHead>
                <TableHead className="text-right">Earning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">No data available</TableCell>
                </TableRow>
              ) : (
                items.map((log: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{log.earning_log_date_created || formatDate(log.created_at)}</TableCell>
                    <TableCell>{log.earning_log_time_created || "—"}</TableCell>
                    <TableCell className="text-center">{log.first_name} {log.last_name}</TableCell>
                    <TableCell className="text-center">{log.slot_no}</TableCell>
                    <TableCell className="text-center">{log.membership_name}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(log.earning_log_amount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {getTotal(directLog) !== null && (
              <tfoot>
                <TableRow>
                  <TableHead colSpan={5} />
                  <TableHead className="text-right font-bold text-green-600">{formatCurrency(getTotal(directLog))}</TableHead>
                </TableRow>
              </tfoot>
            )}
          </Table>
          {getLastPage(directLog) > 1 && (
            <div className="flex justify-end p-4">
              <PaginationControls
                plan="direct" current={getPage("direct")}
                last={getLastPage(directLog)} onPage={(p) => goToPage("direct", p)}
              />
            </div>
          )}
        </div>

        {/* Direct Bonus sub-table */}
        {directBonusLog && getDataArray(directBonusLog).length > 0 && (
          <div className="border-t pt-4 px-4">
            <h4 className="text-sm font-semibold mb-2">Earnings Summary for Direct Bonus</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-center">Trigger</TableHead>
                    <TableHead className="text-center">Owner</TableHead>
                    <TableHead className="text-center">Username</TableHead>
                    <TableHead className="text-center">Membership</TableHead>
                    <TableHead className="text-right">Earning</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDataArray(directBonusLog).map((log: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{log.earning_log_date_created || formatDate(log.created_at)}</TableCell>
                      <TableCell>{log.earning_log_time_created || "—"}</TableCell>
                      <TableCell className="text-center">{log.earning_log_entry_type || "—"}</TableCell>
                      <TableCell className="text-center">{log.first_name} {log.last_name}</TableCell>
                      <TableCell className="text-center">{log.slot_no}</TableCell>
                      <TableCell className="text-center">{log.membership_name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{formatCurrency(log.earning_log_amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {getTotal(directBonusLog) !== null && (
                  <tfoot>
                    <TableRow>
                      <TableHead colSpan={6} />
                      <TableHead className="text-right font-bold text-green-600">{formatCurrency(getTotal(directBonusLog))}</TableHead>
                    </TableRow>
                  </tfoot>
                )}
              </Table>
            </div>
          </div>
        )}

        {/* Direct GC sub-table */}
        {directGcLog && getDataArray(directGcLog).length > 0 && (
          <div className="border-t pt-4 px-4 pb-4">
            <h4 className="text-sm font-semibold mb-2">Earnings Summary for Direct GC</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-center">Trigger</TableHead>
                    <TableHead className="text-center">Owner</TableHead>
                    <TableHead className="text-center">Username</TableHead>
                    <TableHead className="text-center">Membership</TableHead>
                    <TableHead className="text-right">Earning</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDataArray(directGcLog).map((log: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{log.earning_log_date_created || formatDate(log.created_at)}</TableCell>
                      <TableCell>{log.earning_log_time_created || "—"}</TableCell>
                      <TableCell className="text-center">{log.earning_log_entry_type || "—"}</TableCell>
                      <TableCell className="text-center">{log.first_name} {log.last_name}</TableCell>
                      <TableCell className="text-center">{log.slot_no}</TableCell>
                      <TableCell className="text-center">{log.membership_name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{formatCurrency(log.earning_log_amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {getTotal(directGcLog) !== null && (
                  <tfoot>
                    <TableRow>
                      <TableHead colSpan={6} />
                      <TableHead className="text-right font-bold text-green-600">{formatCurrency(getTotal(directGcLog))}</TableHead>
                    </TableRow>
                  </tfoot>
                )}
              </Table>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderIndirectTable() {
    const items = Array.isArray(indirectLog?.log) ? indirectLog.log : [];
    return (
      <div className="space-y-4 p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead className="text-center">Number of Slot(s)</TableHead>
                <TableHead className="text-center">Last Slot Creation</TableHead>
                <TableHead className="text-right">Earning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No data available</TableCell>
                </TableRow>
              ) : (
                items.slice(2).map((log: any, i: number) => (
                  <TableRow key={i} className="cursor-pointer" onClick={() => viewLevelBreakdown(i + 2)}>
                    <TableCell>{log.level_name || `Level ${i + 2}`}</TableCell>
                    <TableCell className="text-center">{log.number_of_slots}</TableCell>
                    <TableCell className="text-center">{log.last_slot_creation}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(log.earnings)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {indirectLog?.total && (
              <tfoot>
                <TableRow>
                  <TableHead colSpan={3} />
                  <TableHead className="text-right font-bold text-green-600">{formatCurrency(indirectLog.total)}</TableHead>
                </TableRow>
              </tfoot>
            )}
          </Table>
        </div>
      </div>
    );
  }

  function renderBinaryContent() {
    const cs = currentSlot as any;
    const bs = cs?.binary_settings || {};
    const showCycleTracker = bs.show_earnings_tracker_per_cycle;
    const showEarningsTracker = bs.show_earnings_tracker;
    const showSlotTracker = bs.show_slot_tracker;
    const binaryLimitType = bs.binary_limit_type || 1;
    const cyclePerDay = bs.cycle_per_day || 1;
    const binaryRealtime = cs?.binary_realtime_commission === 1;
    const strongLegRetention = bs.strong_leg_retention !== 0;

    const limitLabel = binaryLimitType === 1 ? "Pairs" : "Earnings";
    const cycleLabel = ["", "Daily", "Halfday", "Weekly", "Monthly"][cyclePerDay] || "";

    const maxPairs = binaryLog?.max_pairs || 0;
    const todaysPairs = binaryLog?.todays_pairs || 0;

    const isOk = binaryLog?.remarks === "ok";

    return (
      <div className="space-y-4">
        {/* Binary Summary Grid */}
        {binaryLog?.max_pairs && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 pt-4">
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">
                Max. {limitLabel} {cyclePerDay !== 4 ? `(${cycleLabel})` : ""}
              </div>
              <div className="text-lg font-bold">{maxPairs.toLocaleString()}</div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Current {limitLabel}:</div>
              <div className="text-lg font-bold">{todaysPairs.toLocaleString()}</div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">{cycleLabel} {limitLabel} Count:</div>
              <div className={`text-lg font-bold ${isOk ? "text-green-600" : "text-red-600"}`}>
                {todaysPairs.toLocaleString()} / {maxPairs.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Points Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground">Total Left Points</div>
            <div className="text-lg font-bold">{(userInfo.accumulated_left_points || 0).toLocaleString()}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground">Total Right Points</div>
            <div className="text-lg font-bold">{(userInfo.accumulated_right_points || 0).toLocaleString()}</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground">Waiting Left Points</div>
            <div className="text-lg font-bold">{(currentSlot?.slot_left_points || 0).toLocaleString()}</div>
          </div>
          <div className="bg-teal-50 p-3 rounded-lg text-center">
            <div className="text-xs text-muted-foreground">Waiting Right Points</div>
            <div className="text-lg font-bold">{(currentSlot?.slot_right_points || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Binary Sub-tabs */}
        <Tabs value={binarySubTab} onValueChange={setBinarySubTab}>
          <TabsList className="px-4">
            <TabsTrigger value="full">Full Details</TabsTrigger>
            {showCycleTracker && (
              <TabsTrigger value="cycle">{limitLabel} Tracker</TabsTrigger>
            )}
            {showEarningsTracker && (
              <TabsTrigger value="points">Points Tracker Per Level</TabsTrigger>
            )}
            {showSlotTracker && (
              <TabsTrigger value="slots">Slot Tracker Per Level</TabsTrigger>
            )}
          </TabsList>

          {/* Full Details Tab */}
          <TabsContent value="full">
            {tabLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto px-4 pb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center align-middle" rowSpan={2}>Date & Time</TableHead>
                      <TableHead className="text-center" style={{ width: 100 }} rowSpan={2}>Points Left</TableHead>
                      <TableHead className="text-center" style={{ width: 100 }} rowSpan={2}>Points Right</TableHead>
                      <TableHead className="text-center" style={{ width: 100 }} rowSpan={2}>Remain Left</TableHead>
                      <TableHead className="text-center" style={{ width: 100 }} rowSpan={2}>Remain Right</TableHead>
                      <TableHead className="text-center" rowSpan={2}>Membership</TableHead>
                      <TableHead className="text-center" rowSpan={2}>Level Source</TableHead>
                      <TableHead className="text-center" rowSpan={2}>Username</TableHead>
                      <TableHead className="text-center" colSpan={strongLegRetention ? 1 : 3}>Flushout</TableHead>
                      <TableHead className="text-center" colSpan={binaryRealtime ? 1 : 2} rowSpan={binaryRealtime ? 2 : 1}>Income</TableHead>
                    </TableRow>
                    <TableRow>
                      {!strongLegRetention && (
                        <>
                          <TableHead className="text-center">Left Points</TableHead>
                          <TableHead className="text-center">Right Points</TableHead>
                        </>
                      )}
                      <TableHead className="text-center">Earnings</TableHead>
                      {!binaryRealtime && (
                        <>
                          <TableHead className="text-center">Projected</TableHead>
                          <TableHead className="text-center" style={{ display: "none" }} />
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getDataArray(binaryLog).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center text-muted-foreground">No data available</TableCell>
                      </TableRow>
                    ) : (
                      getDataArray(binaryLog).map((log: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="text-center">{formatDateTime(log.binary_points_date_received)}</TableCell>
                          <TableCell className="text-center">
                            {log.binary_old_left}
                            {log.binary_receive_left > 0 && (
                              <> + <span className="text-green-600 font-bold">{log.binary_receive_left}</span></>
                            )}
                            {log.binary_receive_left < 0 && (
                              <> <span className="text-red-500 font-bold">{log.binary_receive_left}</span></>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {log.binary_old_right}
                            {log.binary_receive_right > 0 && (
                              <> + <span className="text-green-600 font-bold">{log.binary_receive_right}</span></>
                            )}
                            {log.binary_receive_right < 0 && (
                              <> <span className="text-red-500 font-bold">{log.binary_receive_right}</span></>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{log.binary_new_left}</TableCell>
                          <TableCell className="text-center">{log.binary_new_right}</TableCell>
                          <TableCell className="text-center">
                            {log.binary_cause_level !== 0 ? log.membership_name || "—" : `Projected ${getPlanLabel("BINARY")} Reset`}
                          </TableCell>
                          <TableCell className="text-center">
                            {log.binary_cause_level !== 0 ? `Level ${log.binary_cause_level}` : "—"}
                          </TableCell>
                          <TableCell className="text-center">{log.cause_no || "—"}</TableCell>
                          {!strongLegRetention && (
                            <>
                              <TableCell className="text-center text-red-500">{log.flushout_points_left || "0.00"}</TableCell>
                              <TableCell className="text-center text-red-500">{log.flushout_points_right || "0.00"}</TableCell>
                            </>
                          )}
                          <TableCell className="text-center text-red-500">
                            {Number(log.binary_points_flushout || 0).toFixed(2)}
                          </TableCell>
                          {!binaryRealtime && (
                            <TableCell className="text-center">{Number(log.binary_points_projected_income || 0).toFixed(2)}</TableCell>
                          )}
                          <TableCell className="text-center font-bold">
                            {formatCurrency(log.binary_points_income)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  {getTotal(binaryLog) !== null && (
                    <tfoot>
                      <TableRow>
                        <TableHead colSpan={binaryRealtime ? 11 : 12}>
                          {strongLegRetention ? "" : ""}
                        </TableHead>
                        <TableHead className="text-center font-bold text-green-600">
                          {totalAmounts?.BINARY || formatCurrency(getTotal(binaryLog))}
                        </TableHead>
                      </TableRow>
                    </tfoot>
                  )}
                </Table>
                {getLastPage(binaryLog) > 1 && (
                  <div className="flex justify-end mt-2">
                    <PaginationControls
                      plan="binary" current={getPage("binary")}
                      last={getLastPage(binaryLog)} onPage={(p) => goToPage("binary", p)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Mentors Bonus sub-table */}
            {mentorsBonusLog && getDataArray(mentorsBonusLog).length > 0 && (
              <div className="border-t pt-4 px-4 pb-4">
                <h4 className="text-sm font-semibold mb-2">Earnings Summary for Mentors Bonus</h4>
                {renderSimpleTable(
                  mentorsBonusLog, "mentors_bonus",
                  ["Date", "Time", "Owner", "Username", "Membership", "Earning"],
                  (item: any) => (
                    <>
                      <TableCell>{item.earning_log_date_created || formatDate(item.created_at)}</TableCell>
                      <TableCell>{item.earning_log_time_created || "—"}</TableCell>
                      <TableCell>{item.first_name} {item.last_name}</TableCell>
                      <TableCell>{item.slot_no}</TableCell>
                      <TableCell>{item.membership_name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{formatCurrency(item.earning_log_amount)}</TableCell>
                    </>
                  )
                )}
              </div>
            )}

            {/* Sponsor Matching sub-table */}
            {sponsorMatchingLog && getDataArray(sponsorMatchingLog).length > 0 && (
              <div className="border-t pt-4 px-4 pb-4">
                <h4 className="text-sm font-semibold mb-2">Earnings Summary for Sponsor Matching</h4>
                {renderSimpleTable(
                  sponsorMatchingLog, "sponsor_matching",
                  ["Date", "Time", "Owner", "Username", "Membership", "Earning"],
                  (item: any) => (
                    <>
                      <TableCell>{item.earning_log_date_created || formatDate(item.created_at)}</TableCell>
                      <TableCell>{item.earning_log_time_created || "—"}</TableCell>
                      <TableCell>{item.first_name} {item.last_name}</TableCell>
                      <TableCell>{item.slot_no}</TableCell>
                      <TableCell>{item.membership_name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{formatCurrency(item.earning_log_amount)}</TableCell>
                    </>
                  )
                )}
              </div>
            )}
          </TabsContent>

          {/* Cycle Tracker Tab */}
          <TabsContent value="cycle">
            {renderBinaryCycleTracker()}
          </TabsContent>

          {/* Points Tracker Tab */}
          <TabsContent value="points">
            {renderBinaryPointsTracker()}
          </TabsContent>

          {/* Slot Tracker Tab */}
          <TabsContent value="slots">
            {renderBinarySlotTracker()}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  function renderBinaryCycleTracker() {
    const bs2 = (currentSlot as any)?.binary_settings || {};
    const cyclePerDayCom = bs2.cycle_per_day || 1;
    const binaryLimitTypeCom = bs2.binary_limit_type || 1;
    const items = getDataArray(binaryPointsLog);

    return (
      <div className="overflow-x-auto px-4 pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">No.</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">
                {["", "Pairs", "Earnings"][binaryLimitTypeCom] || ""}
                {["", " per Day", " Morning/Afternoon", " per Week", ""][cyclePerDayCom] || ""}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">No data available</TableCell>
              </TableRow>
            ) : (
              items.map((log: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell className="text-center">{formatDate(log.earning_log_date_created)}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-green-600 font-bold">
                      {binaryLimitTypeCom === 1
                        ? `${log.earnings || log.total_pairs} / ${binaryLog?.max_pairs}`
                        : `${formatCurrency(log.earnings || log.total_earnings)} / ${formatCurrency(binaryLog?.max_pairs)}`
                      }
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {getLastPage(binaryPointsLog) > 1 && (
          <div className="flex justify-end mt-2">
            <PaginationControls
              plan="binary_points" current={getPage("binary_points")}
              last={getLastPage(binaryPointsLog)} onPage={(p) => setPage("binary_points", p)}
            />
          </div>
        )}
      </div>
    );
  }

  function renderBinaryPointsTracker() {
    const items = getDataArray(binaryPointsLog);
    const maxPoints = binaryPointsLog?.max_points_per_level || 0;

    return (
      <div className="overflow-x-auto px-4 pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Level Source</TableHead>
              <TableHead className="text-center">Left Points</TableHead>
              <TableHead className="text-center">Right Points</TableHead>
              <TableHead className="text-center">Earnings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">No data available</TableCell>
              </TableRow>
            ) : (
              items.map((log: any, i: number) => (
                <TableRow key={i} className={
                  log.left_points === maxPoints && log.right_points === maxPoints ? "bg-green-50" : ""
                }>
                  <TableCell className="text-center">Level {log.binary_cause_level}</TableCell>
                  <TableCell className={`text-center ${log.left_points === maxPoints ? "font-bold text-green-600" : ""}`}>
                    {Number(log.left_points || 0).toLocaleString()}
                    {maxPoints > 0 && ` / ${maxPoints.toLocaleString()}`}
                  </TableCell>
                  <TableCell className={`text-center ${log.right_points === maxPoints ? "font-bold text-green-600" : ""}`}>
                    {Number(log.right_points || 0).toLocaleString()}
                    {maxPoints > 0 && ` / ${maxPoints.toLocaleString()}`}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-green-600">
                    {formatCurrency(log.earnings)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {getLastPage(binaryPointsLog) > 1 && (
          <div className="flex justify-end mt-2">
            <PaginationControls
              plan="binary_points" current={getPage("binary_points")}
              last={getLastPage(binaryPointsLog)} onPage={(p) => setPage("binary_points", p)}
            />
          </div>
        )}
      </div>
    );
  }

  function renderBinarySlotTracker() {
    const items = getDataArray(binarySlotLimitLog);
    const memberships = binarySlotLimitLog?.membership || [];
    const slotPerLevel = binarySlotLimitLog?.slot_per_level || {};
    const maxSlotPerLevel = binarySlotLimitLog?.max_slot_per_level || {};

    return (
      <div className="overflow-x-auto px-4 pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center" rowSpan={2}>Level Source</TableHead>
              {memberships.map((m: any) => (
                <TableHead className="text-center" colSpan={2} key={m.membership_id}>
                  {m.membership_name}
                </TableHead>
              ))}
              <TableHead className="text-center" rowSpan={2}>Total Slot</TableHead>
            </TableRow>
            <TableRow>
              {memberships.map((m: any) => (
                <>
                  <TableHead className="text-center" key={`l-${m.membership_id}`}>Left</TableHead>
                  <TableHead className="text-center" key={`r-${m.membership_id}`}>Right</TableHead>
                </>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2 + memberships.length * 2} className="text-center text-muted-foreground">No data available</TableCell>
              </TableRow>
            ) : (
              items.map((log: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="text-center">Level {log.placement_level}</TableCell>
                  {memberships.map((m: any) => {
                    const levelData = slotPerLevel[log.placement_level]?.[m.membership_id] || {};
                    const maxSlots = maxSlotPerLevel[m.membership_id] || 0;
                    return (
                      <>
                        <TableCell className={`text-center ${levelData.left === maxSlots ? "font-bold text-green-600" : ""}`}>
                          {levelData.left || 0} / {maxSlots}
                        </TableCell>
                        <TableCell className={`text-center ${levelData.right === maxSlots ? "font-bold text-green-600" : ""}`}>
                          {levelData.right || 0} / {maxSlots}
                        </TableCell>
                      </>
                    );
                  })}
                  <TableCell className="text-center font-bold">{log.total_slot_count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {getLastPage(binarySlotLimitLog) > 1 && (
          <div className="flex justify-end mt-2">
            <PaginationControls
              plan="binary_slot_limit" current={getPage("binary_slot_limit")}
              last={getLastPage(binarySlotLimitLog)} onPage={(p) => setPage("binary_slot_limit", p)}
            />
          </div>
        )}
      </div>
    );
  }

  function renderUnilevelContent() {
    return (
      <Tabs defaultValue="points" className="px-4">
        <TabsList>
          <TabsTrigger value="points">Points Summary For this Cutoff</TabsTrigger>
          <TabsTrigger value="history">Earning History</TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <div className="overflow-x-auto pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-center">Number of Slot(s)</TableHead>
                  <TableHead className="text-center">Last Purchase</TableHead>
                  <TableHead className="text-right">Group PV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!unilevelLog ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No data available</TableCell>
                  </TableRow>
                ) : (
                  <>
                    {unilevelLog.log_personal && (
                      <TableRow className="cursor-pointer" onClick={() => viewLevelBreakdown(-1)}>
                        <TableCell>{unilevelLog.log_personal.level_name}</TableCell>
                        <TableCell className="text-center">{unilevelLog.log_personal.number_of_slots}</TableCell>
                        <TableCell className="text-center">{unilevelLog.log_personal.last_slot_creation}</TableCell>
                        <TableCell className="text-right">{unilevelLog.log_personal.earnings}</TableCell>
                      </TableRow>
                    )}
                    {Array.isArray(unilevelLog.log) && unilevelLog.log.map((log: any, i: number) => (
                      <TableRow key={i} className="cursor-pointer" onClick={() => viewLevelBreakdown(i)}>
                        <TableCell>{log.level_name}</TableCell>
                        <TableCell className="text-center">{log.number_of_slots}</TableCell>
                        <TableCell className="text-center">{log.last_slot_creation}</TableCell>
                        <TableCell className="text-right">{log.earnings}</TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {/* Date filter */}
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">Start Date</Label>
              <Input type="date" className="w-40" value={startDate}
                onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Date</Label>
              <Input type="date" className="w-40" value={endDate}
                onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button size="sm" onClick={() => loadPlanData("unilevel", 1)}>
              <Calendar className="h-3 w-3 mr-1" /> Filter
            </Button>
          </div>

          <div className="overflow-x-auto pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-center">Owner</TableHead>
                  <TableHead className="text-center">Username</TableHead>
                  <TableHead className="text-center">Membership</TableHead>
                  <TableHead className="text-right">Earning</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getDataArray(unilevelLog).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">No data available</TableCell>
                  </TableRow>
                ) : (
                  getDataArray(unilevelLog).map((log: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{log.earning_log_date_created || formatDate(log.created_at)}</TableCell>
                      <TableCell>{log.earning_log_time_created || "—"}</TableCell>
                      <TableCell className="text-center">{log.first_name} {log.last_name}</TableCell>
                      <TableCell className="text-center">{log.slot_no}</TableCell>
                      <TableCell className="text-center">{log.membership_name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{formatCurrency(log.earning_log_amount)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => viewLevelBreakdown(log.level || i)}>
                          <Eye className="h-3 w-3 mr-1" /> Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {getLastPage(unilevelLog) > 1 && (
              <div className="flex justify-end mt-2">
                <PaginationControls
                  plan="unilevel" current={getPage("unilevel")}
                  last={getLastPage(unilevelLog)} onPage={(p) => goToPage("unilevel", p)}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  function renderSimpleTable(
    data: any, planKey: string,
    headers: string[],
    renderRow: (item: any) => React.ReactNode
  ) {
    const items = getDataArray(data);
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h} className={h === "Earning" ? "text-right" : ""}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length} className="text-center text-muted-foreground">No data available</TableCell>
              </TableRow>
            ) : (
              items.map((item: any, i: number) => (
                <TableRow key={i}>{renderRow(item)}</TableRow>
              ))
            )}
          </TableBody>
          {getTotal(data) !== null && (
            <tfoot>
              <TableRow>
                <TableHead colSpan={headers.length - 1} />
                <TableHead className="text-right font-bold text-green-600">{formatCurrency(getTotal(data))}</TableHead>
              </TableRow>
            </tfoot>
          )}
        </Table>
        {getLastPage(data) > 1 && (
          <div className="flex justify-end p-2">
            <PaginationControls
              plan={planKey} current={getPage(planKey)}
              last={getLastPage(data)} onPage={(p) => goToPage(planKey, p)}
            />
          </div>
        )}
      </div>
    );
  }

  function PaginationControls({ plan, current, last, onPage }: {
    plan: string; current: number; last: number; onPage: (p: number) => void;
  }) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => onPage(current - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Page {current} of {last}</span>
        <Button variant="outline" size="sm" disabled={current >= last} onClick={() => onPage(current + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }
}
