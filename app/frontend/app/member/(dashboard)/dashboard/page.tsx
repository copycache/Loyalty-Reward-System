"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { WalletLogTable } from "@/components/member/dashboard/WalletLogTable";
import { MoveWalletDialog } from "@/components/member/dashboard/MoveWalletDialog";
import { DashboardCountdown } from "@/components/member/dashboard/DashboardCountdown";

import { apiPost } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { toast } from "sonner";
import {
  Wallet,
  TrendingUp,
  Users,
  Network,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Plus,
  ChevronRight,
  Loader2,
  FileText,
  CircleDollarSign,
  Gift,
  UserCheck,
  PiggyBank,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function MemberDashboardPage() {
  const { user, currentSlot, token } = useAuthStore();
  const [wallets, setWallets] = useState<any>(null);
  const [binaryOverview, setBinaryOverview] = useState<any>(null);
  const [binaryLog, setBinaryLog] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currencyList, setCurrencyList] = useState<any[]>([]);
  const [unplacedSlots, setUnplacedSlots] = useState<any[]>([]);
  const [planStatus, setPlanStatus] = useState<any>({});
  const [planLabel, setPlanLabel] = useState<any>({});
  const [cashinHistory, setCashinHistory] = useState<any[]>([]);
  const [cashoutHistory, setCashoutHistory] = useState<any[]>([]);
  const [upgradeHistory, setUpgradeHistory] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [binarySettings, setBinarySettings] = useState<any>({});
  const [todaysPairs, setTodaysPairs] = useState(0);
  const [maxPairs, setMaxPairs] = useState(0);
  const [formattedCountdown, setFormattedCountdown] = useState("");

  const [showUpgradeNotif, setShowUpgradeNotif] = useState(false);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [walletRes, binaryRes, slotsRes, annRes, currencyRes, unplacedRes, planStatusRes, planLabelRes, userInfoRes, binaryLogRes] = await Promise.all([
          apiPost("/api/get_total", {}, token),
          apiPost("/api/member/get_earning", { plan: "BINARY" }, token),
          apiPost("/api/all_slot", {}, token),
          apiPost("/api/member/leaderboard/load_announcement", {}, token),
          apiPost("/api/member/get_currency", {}, token),
          apiPost("/api/check_unplaced_slot", { slot_id: currentSlot?.slot_id }, token),
          apiPost("/api/member/slot_plan_status", {}, token),
          apiPost("/api/member/plan_label", {}, token),
          apiPost("/api/member/get_user_info", {}, token),
          apiPost("/api/member/get_binary_log", { slot_id: currentSlot?.slot_id }, token),
        ]);

        if (walletRes?.data) setWallets(walletRes.data);
        if (binaryRes?.data) setBinaryOverview(binaryRes.data);
        if (slotsRes?.data) setSlots(slotsRes.data);
        if (annRes?.data) setAnnouncements(annRes.data);
        if (Array.isArray(currencyRes)) setCurrencyList(currencyRes);
        else if (currencyRes?.data) setCurrencyList(currencyRes.data);
        if (unplacedRes && Array.isArray(unplacedRes) && unplacedRes.length > 0) setUnplacedSlots(unplacedRes);
        if (planStatusRes?.data) setPlanStatus(planStatusRes.data);
        else if (planStatusRes) setPlanStatus(planStatusRes);
        if (planLabelRes?.data) setPlanLabel(planLabelRes.data);
        else if (planLabelRes) setPlanLabel(planLabelRes);
        if (userInfoRes?.data) setUserInfo(userInfoRes.data);
        else if (userInfoRes) setUserInfo(userInfoRes);
        if (binaryLogRes?.data) {
          setBinaryLog(binaryLogRes.data);
          const bl = binaryLogRes.data;
          setTodaysPairs(parseFloat(bl.todays_pairs) || 0);
          setMaxPairs(parseFloat(bl.max_pairs) || 1);
          if (bl.binary_settings) setBinarySettings(bl.binary_settings);
        } else if (binaryLogRes) {
          setBinaryLog(binaryLogRes);
          setTodaysPairs(parseFloat(binaryLogRes.todays_pairs) || 0);
          setMaxPairs(parseFloat(binaryLogRes.max_pairs) || 1);
          if (binaryLogRes.binary_settings) setBinarySettings(binaryLogRes.binary_settings);
        }
      } catch (e) {
        console.error("Dashboard fetch error", e);
      }
      setLoading(false);
    };
    fetchData();

    if (typeof window !== "undefined" && localStorage.getItem("member_upgrade")) setShowUpgradeNotif(true);
    if (currentSlot?.welcome_bonus_notif) setShowWelcomeBonus(true);
  }, [token, currentSlot]);

  useEffect(() => {
    if (!token || !currentSlot) return;
    apiPost("/api/member/cashin_history", { slot_id: currentSlot.slot_id }, token).then((r: any) => {
      if (r?.data) setCashinHistory(r.data);
      else if (Array.isArray(r)) setCashinHistory(r);
    }).catch(() => {});
    apiPost("/api/member/cashout_history", { slot_id: currentSlot.slot_id }, token).then((r: any) => {
      if (r?.data) setCashoutHistory(r.data);
      else if (Array.isArray(r)) setCashoutHistory(r);
    }).catch(() => {});
    apiPost("/api/member/upgrade_history", { slot_id: currentSlot.slot_id }, token).then((r: any) => {
      if (r?.data) setUpgradeHistory(r.data);
      else if (Array.isArray(r)) setUpgradeHistory(r);
    }).catch(() => {});
  }, [token, currentSlot]);

  const copyReferralLink = () => {
    if (currentSlot?.slot_no) {
      const link = `${window.location.origin}/store/link/${currentSlot.slot_no}`;
      navigator.clipboard.writeText(link);
      toast.success("Referral link copied!");
    }
  };

  const formatCurrency = (val: any) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const slotType = currentSlot?.slot_type;
  const isPS = slotType === "PS";
  const isFirstSlot = currentSlot?.slot_id === currentSlot?.first_slot?.slot_id;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Notifications */}
      {showUpgradeNotif && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 flex justify-between items-center" role="alert">
          <div>
            <p className="font-bold">Upgrade Available</p>
            <p>Please check your membership upgrade in settings.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setShowUpgradeNotif(false); localStorage.removeItem("member_upgrade"); }}>Dismiss</Button>
        </div>
      )}
      {showWelcomeBonus && currentSlot?.welcome_bonus_wallet > 0 && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 flex justify-between items-center" role="alert">
          <div>
            <p className="font-bold">Welcome Bonus</p>
            <p>You received PHP {formatCurrency(currentSlot.welcome_bonus_wallet)} welcome bonus!</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowWelcomeBonus(false)}>Dismiss</Button>
        </div>
      )}

      {/* Profile Section */}
      {userInfo && (
        <Card className="bg-[#820d06] text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                {userInfo.profile_picture ? (
                  <img src={userInfo.profile_picture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                    {userInfo.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold uppercase">{userInfo.name}</div>
                {currentSlot?.slot_id_number && <div className="text-sm text-white/80">ID Number: {currentSlot.slot_id_number}</div>}
                <div className="text-sm text-white/80">Username: {currentSlot?.slot_no?.toUpperCase()}</div>
                <div className="text-sm text-white/80">Package: {currentSlot?.membership_name}</div>
                <div className="text-sm text-white/80">
                  Sponsor Username: {isFirstSlot ? currentSlot?.slot_sponsor_code?.toUpperCase() : currentSlot?.sponsor_name?.toUpperCase()}
                </div>
                <Badge variant="outline" className="mt-1 bg-white/20 text-white border-white/30">
                  {isFirstSlot ? "Main Account" : `Account-${currentSlot?.slot_count_id}`}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={copyReferralLink}>
                  <Copy className="h-4 w-4 mr-1" /> Referral Link
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/member/settings/profile">Settings</Link>
                </Button>
                {isPS && currentSlot?.slot_count > 1 && (
                  <Button variant="secondary" size="sm" asChild>
                    <Link href="/member/slot">Switch Slot</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state if no userInfo */}
      {!userInfo && currentSlot && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center text-2xl font-bold text-gray-400">
                {currentSlot?.slot_no?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold">{currentSlot?.slot_no?.toUpperCase()}</div>
                {currentSlot?.membership_name && <div className="text-sm text-muted-foreground">Package: {currentSlot.membership_name}</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallets Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wallets</h2>
        <MoveWalletDialog />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isPS && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Accumulated Earnings</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">PHP {formatCurrency(currentSlot?.accumulated_earnings)}</div></CardContent>
          </Card>
        )}
        {wallets?.map((item: any) => {
          if (item.currency_id == 1 || (isPS && item.currency_id != 1)) {
            let label = "Available Wallet";
            if (item.currency_id == 4) label = "Available GC";
            else if (item.currency_id != 1) label = item.currency_name;
            return (
              <Card key={item.currency_id}>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{item.currency_abbreviation || "PHP"} {formatCurrency(item.wallet_amount)}</div></CardContent>
              </Card>
            );
          }
          return null;
        })}
        {isPS && planStatus["DIRECT"] == 1 && (
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{planLabel["DIRECT"] || "Direct Bonus"}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PHP {formatCurrency(currentSlot?.direct_bonus)}</div></CardContent></Card>
        )}
        {isPS && planStatus["BINARY"] == 1 && (
          <>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{planLabel["BINARY"] || "Binary Bonus"}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PHP {formatCurrency(currentSlot?.binary_wallet)}</div></CardContent></Card>
            {currentSlot?.binary_realtime_commission == 0 && (
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{planLabel["BINARY_PROJECTED_INCOME"] || "Binary Projected Income"}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PHP {formatCurrency(currentSlot?.binary_projected_income_wallet)}</div><DashboardCountdown resetDate={currentSlot?.slot_date_placed} resetDays={binarySettings?.binary_pair_flushout_days} realtimeCommission={currentSlot?.binary_realtime_commission} /></CardContent></Card>
            )}
            {binaryLog?.binary_gc_enable && (
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{planLabel["BINARY"] || "Binary"} GC</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">GC {formatCurrency(currentSlot?.gc_binary_wallet)}</div></CardContent></Card>
            )}
          </>
        )}
        {isPS && planStatus["INDIRECT"] == 1 && (
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{planLabel["INDIRECT"] || "Indirect Bonus"}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PHP {formatCurrency(currentSlot?.indirect_bonus)}</div></CardContent></Card>
        )}
        {isPS && planStatus["UNILEVEL"] == 1 && currentSlot?.show_unilevel == 1 && (
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{planLabel["UNILEVEL"] || "Unilevel"}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PHP {formatCurrency(currentSlot?.unilevel_wallet)}</div></CardContent></Card>
        )}
        {isPS && planStatus["BINARY"] == 1 && binaryLog?.binary_mentors_enable && (
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{planLabel["MENTORS_BONUS"] || "Mentors Bonus"}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PHP {formatCurrency(currentSlot?.mentors_wallet)}</div></CardContent></Card>
        )}
        {isPS && planStatus["DROPSHIPPING_BONUS"] == 1 && (
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{planLabel["DROPSHIPPING_BONUS"] || "Dropshipping Bonus"}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PHP {formatCurrency(currentSlot?.dropshipping_bonus)}</div></CardContent></Card>
        )}
        {isPS && planStatus["WELCOME_BONUS"] == 1 && (
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{planLabel["WELCOME_BONUS"] || "Welcome Bonus"}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PHP {formatCurrency(currentSlot?.welcome_bonus_wallet)}</div></CardContent></Card>
        )}
      </div>

      {/* Binary Analytics */}
      {isPS && planStatus["BINARY"] == 1 && binaryLog && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Binary Analytics</h2>
          {binaryLog?.direct_status?.qualified === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <div className="font-bold mb-1"><AlertTriangle className="h-4 w-4 inline mr-1" />WARNING</div>
              <p className="text-sm">You are not eligible to receive binary points. A minimum of <strong>{binaryLog.direct_status.direct_required}</strong> direct referrals is required to qualify for binary points, but you currently have {binaryLog.direct_status.count_direct > 0 ? `only ${binaryLog.direct_status.count_direct} direct referral(s).` : "no direct referrals."}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{["Daily", "Twice Daily", "Weekly"][binarySettings?.cycle_per_day - 1] || ""} Maximum {["Pairs", "Earnings"][binarySettings?.binary_limit_type - 1] || ""}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#e7e8ea" strokeWidth="10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#820d06" strokeWidth="10"
                      strokeDasharray={`${(todaysPairs / maxPairs) * 327} 327`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{Math.round(todaysPairs).toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/ {Math.round(maxPairs).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Binary Points</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Left Waiting Points</span><span className="font-bold">{parseFloat(currentSlot?.slot_left_points || 0).toLocaleString()} pts</span></div>
                  <div className="w-full bg-gray-200 rounded h-2"><div className="bg-blue-600 rounded h-2" style={{ width: `${Math.min((currentSlot?.slot_left_points || 0) / ((userInfo?.accumulated_left_points || 1) + (userInfo?.accumulated_right_points || 1) + (currentSlot?.slot_left_points || 0) + (currentSlot?.slot_right_points || 0)) * 100, 100)}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Right Waiting Points</span><span className="font-bold">{parseFloat(currentSlot?.slot_right_points || 0).toLocaleString()} pts</span></div>
                  <div className="w-full bg-gray-200 rounded h-2"><div className="bg-green-600 rounded h-2" style={{ width: `${Math.min((currentSlot?.slot_right_points || 0) / ((userInfo?.accumulated_left_points || 1) + (userInfo?.accumulated_right_points || 1) + (currentSlot?.slot_left_points || 0) + (currentSlot?.slot_right_points || 0)) * 100, 100)}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Left Accumulated Points</span><span className="font-bold">{parseFloat(userInfo?.accumulated_left_points || 0).toLocaleString()} pts</span></div>
                  <div className="w-full bg-gray-200 rounded h-2"><div className="bg-blue-300 rounded h-2" style={{ width: `${Math.min((userInfo?.accumulated_left_points || 0) / ((userInfo?.accumulated_left_points || 1) + (userInfo?.accumulated_right_points || 1)) * 100, 100)}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Right Accumulated Points</span><span className="font-bold">{parseFloat(userInfo?.accumulated_right_points || 0).toLocaleString()} pts</span></div>
                  <div className="w-full bg-gray-200 rounded h-2"><div className="bg-green-300 rounded h-2" style={{ width: `${Math.min((userInfo?.accumulated_right_points || 0) / ((userInfo?.accumulated_left_points || 1) + (userInfo?.accumulated_right_points || 1)) * 100, 100)}%` }} /></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* History Tabs */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        <Tabs defaultValue="wallet">
          <TabsList>
            <TabsTrigger value="wallet">Wallet History</TabsTrigger>
            <TabsTrigger value="cashin">Top-Up History</TabsTrigger>
            <TabsTrigger value="cashout">Withdraw History</TabsTrigger>
            <TabsTrigger value="upgrade">Upgrade History</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet">
            <WalletLogTable walletTypes={currencyList} />
          </TabsContent>

          <TabsContent value="cashin">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Process Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Wallet Addition</TableHead>
                      <TableHead>Charge</TableHead>
                      <TableHead>Top-up Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashinHistory.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No top-up history found.</TableCell></TableRow>
                    ) : (
                      cashinHistory.map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{item.cash_in_date || item.created_at}</TableCell>
                          <TableCell>{item.process_date || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === "Processed" ? "default" : item.status === "pending" ? "secondary" : "destructive"}>{item.status}</Badge>
                          </TableCell>
                          <TableCell>PHP {formatCurrency(item.wallet_addition || item.cash_in_amount)}</TableCell>
                          <TableCell>PHP {formatCurrency(item.charge || 0)}</TableCell>
                          <TableCell>PHP {formatCurrency(item.payable || item.cash_in_amount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashout">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Process Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Wallet Deduction</TableHead>
                      <TableHead>Other Charge</TableHead>
                      <TableHead>Withdraw Amount</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Control No.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashoutHistory.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No withdraw history found.</TableCell></TableRow>
                    ) : (
                      cashoutHistory.map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{item.cash_out_date || item.created_at}</TableCell>
                          <TableCell>{item.process_date || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === "Processed" ? "default" : item.status === "pending" ? "secondary" : "destructive"}>{item.status}</Badge>
                          </TableCell>
                          <TableCell>PHP {formatCurrency(item.wallet_deduction || 0)}</TableCell>
                          <TableCell>PHP {formatCurrency(item.other_charge || 0)}</TableCell>
                          <TableCell>PHP {formatCurrency(item.withdraw_amount || 0)}</TableCell>
                          <TableCell>{item.sender_name || "—"}</TableCell>
                          <TableCell>{item.control_number || "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upgrade">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upgradeHistory.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No upgrade history found.</TableCell></TableRow>
                    ) : (
                      upgradeHistory.map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{item.created_at || item.date}</TableCell>
                          <TableCell>{item.from_membership || item.old_membership || "—"}</TableCell>
                          <TableCell>{item.to_membership || item.new_membership || "—"}</TableCell>
                          <TableCell>PHP {formatCurrency(item.amount || 0)}</TableCell>
                          <TableCell><Badge>{item.status || "Completed"}</Badge></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
