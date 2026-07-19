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
} from "lucide-react";
import Link from "next/link";

export default function MemberDashboardPage() {
  const { user, currentSlot, token } = useAuthStore();
  const [wallets, setWallets] = useState<any>(null);
  const [binaryOverview, setBinaryOverview] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currencyList, setCurrencyList] = useState<any[]>([]);
  const [unplacedSlots, setUnplacedSlots] = useState<any[]>([]);

  // Notifs
  const [showUpgradeNotif, setShowUpgradeNotif] = useState(false);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [walletRes, binaryRes, slotsRes, annRes, currencyRes, unplacedRes] = await Promise.all([
          apiPost("/api/get_total", {}, token),
          apiPost("/api/member/get_earning", { plan: "BINARY" }, token),
          apiPost("/api/all_slot", {}, token),
          apiPost("/api/member/leaderboard/load_announcement", {}, token),
          apiPost("/api/member/get_currency", {}, token), // Check API endpoint validity
          apiPost("/api/check_unplaced_slot", { slot_id: currentSlot?.slot_id }, token),
        ]);

        if (walletRes?.data) setWallets(walletRes.data);
        if (binaryRes?.data) setBinaryOverview(binaryRes.data);
        if (slotsRes?.data) setSlots(slotsRes.data);
        if (annRes?.data) setAnnouncements(annRes.data);
        if (currencyRes?.data) setCurrencyList(currencyRes.data); // Adjust if response structure differs
        // Legacy: this.currency = response; if response is array
        if (Array.isArray(currencyRes)) setCurrencyList(currencyRes);
        else if (currencyRes?.data) setCurrencyList(currencyRes.data);

        if (unplacedRes && Array.isArray(unplacedRes) && unplacedRes.length > 0) {
            setUnplacedSlots(unplacedRes);
        }
        
      } catch (e) {
        console.error("Dashboard fetch error", e);
      }
      setLoading(false);
    };
    fetchData();

    // Check localStorage for upgrade notif
    if (typeof window !== "undefined") {
        if (localStorage.getItem("member_upgrade")) {
            setShowUpgradeNotif(true);
        }
    }
    
    if (currentSlot?.welcome_bonus_notif) {
        setShowWelcomeBonus(true);
    }

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
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  };

  const closeUpgradeNotif = () => {
      localStorage.removeItem("member_upgrade");
      setShowUpgradeNotif(false);
  };

  const closeWelcomeBonus = async () => {
      await apiPost("/api/settings/close_welcome_bonus_notif", { slot_id: currentSlot?.slot_id }, token);
      setShowWelcomeBonus(false);
      // Re-fetch logic if needed
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {showUpgradeNotif && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 flex justify-between items-center" role="alert">
              <div>
                  <p className="font-bold">Upgrade Available!</p>
                  <p>You are eligible for an upgrade.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeUpgradeNotif}>Dismiss</Button>
          </div>
      )}
      {showWelcomeBonus && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 flex justify-between items-center" role="alert">
              <div>
                  <p className="font-bold">Welcome Bonus!</p>
                  <p>Congratulations on your welcome bonus.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeWelcomeBonus}>Close</Button>
          </div>
      )}

      {unplacedSlots.length > 0 && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 flex justify-between items-center" role="alert">
             <div>
                <p className="font-bold">Unplaced Slots Detected</p>
                <p>You have {unplacedSlots.length} unplaced slots waiting to be positioned.</p>
             </div>
             <Button variant="default" size="sm" asChild>
                <Link href="/member/genealogy">Go to Genealogy</Link>
             </Button>
          </div>
      )}

      {/* Countdown */}
      <DashboardCountdown 
        resetDate={currentSlot?.last_binary_projected_income_reset_date}
        resetDays={currentSlot?.binary_waiting_commission_reset_days}
        realtimeCommission={currentSlot?.binary_realtime_commission}
      />

      {/* Welcome & Profile Summary */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.first_name}! 👋
          </h1>
          <p className="text-muted-foreground">
            {currentSlot?.slot_no && (
              <>Slot: <span className="font-semibold">{currentSlot.slot_no}</span> · </>
            )}
            {currentSlot?.rank_name && (
              <Badge variant="secondary">{currentSlot.rank_name}</Badge>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {currencyList.length > 0 && (
             <MoveWalletDialog walletTypes={currencyList} onSuccess={() => window.location.reload()} />
          )}
          <Button variant="outline" size="sm" onClick={copyReferralLink}>
            <Copy className="h-4 w-4 mr-1" /> Referral Link
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" asChild>
            <Link href="/member/shopping">
              <Plus className="h-4 w-4 mr-1" /> Shop Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(wallets?.accumulated_earnings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PHP Wallet
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(wallets?.php_wallet)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              GC Wallet
            </CardTitle>
            <Wallet className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(wallets?.gc_wallet)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CD Wallet
            </CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(wallets?.cd_wallet)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bonus Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Direct Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(wallets?.direct_bonus)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Binary Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(wallets?.binary_bonus)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Indirect Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(wallets?.indirect_bonus)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Binary Overview */}
      {binaryOverview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" /> Binary Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Left Side</p>
                <p className="text-2xl font-bold">{binaryOverview.left_count || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Points: {binaryOverview.left_points || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Right Side</p>
                <p className="text-2xl font-bold">{binaryOverview.right_count || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Points: {binaryOverview.right_points || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Slots */}
      {slots.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Slots</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/member/slot">
                Manage <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {slots.slice(0, 6).map((slot: any) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-sm">{slot.slot_no}</p>
                    <p className="text-xs text-muted-foreground">{slot.package_name}</p>
                  </div>
                  <Badge variant={slot.status === "active" ? "default" : "secondary"}>
                    {slot.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="p-3 bg-muted rounded-lg">
                <p className="font-semibold text-sm">{ann.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{ann.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Wallet Logs */}
      <Card>
        <CardHeader>
            <CardTitle>Wallet History</CardTitle>
            <CardDescription>Recent transactions and logs</CardDescription>
        </CardHeader>
        <CardContent>
             <WalletLogTable walletTypes={currencyList} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
          <Link href="/member/earning">
            <FileText className="h-6 w-6" />
            <span className="text-xs">Transactions</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
          <Link href="/member/genealogy">
            <Network className="h-6 w-6" />
            <span className="text-xs">Genealogy</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
          <Link href="/member/cashin">
            <ArrowDownRight className="h-6 w-6" />
            <span className="text-xs">Cash In</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
          <Link href="/member/cashout">
            <ArrowUpRight className="h-6 w-6" />
            <span className="text-xs">Withdraw</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
