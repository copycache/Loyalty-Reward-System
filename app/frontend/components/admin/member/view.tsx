"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InformationTab } from "./view/information";
import { DetailsTab } from "./view/details";
import { EarningsTab } from "./view/earning-history";
import { DistributedTab } from "./view/distributed-income";
import { WalletTab } from "./view/wallet-history";
import { PayoutTab } from "./view/payout-history";
import { PointsTab } from "./view/points-history";
import { NetworkTab } from "./view/network-list";
import { CodevaultTab } from "./view/codevault";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, History, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

type DetailTab =
  | "info"
  | "details"
  | "earnings"
  | "distributed"
  | "wallet"
  | "payout"
  | "points"
  | "network"
  | "codevault";

interface SlotData {
  slot_id: number;
  slot_no: string;
  name: string;
  [key: string]: unknown;
}

interface MembershipOption {
  membership_id: number | string;
  membership_name: string;
}

interface MemberViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: SlotData | null;
  membershipOptions: MembershipOption[];
  countryList: any[];
  planList: any[];
  currencies: any[];
  defaultCurrencyId?: string;
  onRefresh: () => void;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

export function MemberViewModal({
  open,
  onOpenChange,
  slot,
  membershipOptions,
  countryList,
  planList,
  currencies,
  defaultCurrencyId,
  onRefresh,
}: MemberViewModalProps) {
  const { token } = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const [detailTab, setDetailTab] = useState<DetailTab>("info");
  const [slotInfo, setSlotInfo] = useState<Record<string, any> | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [slotCodeHistory, setSlotCodeHistory] = useState<any>(null);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustId, setAdjustId] = useState("");
  const [adjustCode, setAdjustCode] = useState("");
  const [adjustTrigger, setAdjustTrigger] = useState("1");
  const [adjustCurrencyId, setAdjustCurrencyId] = useState("");
  const [adjustPlan, setAdjustPlan] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("0");
  const [adjustLoading, setAdjustLoading] = useState(false);

  function loadSlot() {
    if (!token || !slot) return;
    setDetailTab("info");
    setSlotInfo(null);
    apiPost<any>("/api/member/get_slot_information", { id: slot.slot_id }, token)
      .then((r) => {
        setSlotInfo(r);
        setAdjustId(String(r?.slot_id ?? slot.slot_id));
        setAdjustCode(r?.slot_no ?? slot.slot_no);
      })
      .catch(() => setSlotInfo({}));
  }

  useEffect(() => {
    if (open && slot) {
      setAdjustCurrencyId(defaultCurrencyId || "");
      loadSlot();
    }
  }, [open, slot]);

  function loadDetailTab(tab: string) {
    setDetailTab(tab as DetailTab);
  }

  async function getHistorySlotCodeChanges() {
    if (!token || !slot) return;
    try {
      const res = await apiPost<any>("/api/member/slot_code_history", { id: slot.slot_id }, token);
      setSlotCodeHistory(res);
      setHistoryOpen(true);
    } catch {
      toast.error("Failed to load history");
    }
  }

  async function handleAdjustWallet() {
    if (!token) return;
    setAdjustLoading(true);
    try {
      await apiPost(
        "/api/member/adjust_wallet",
        {
          slot_id: adjustId,
          trigger: adjustTrigger,
          plan: adjustPlan,
          amount: adjustAmount,
          currency_id: adjustCurrencyId,
          user,
        },
        token
      );
      toast.success("Wallet adjusted");
      setAdjustOpen(false);
      setAdjustAmount("0");
      onRefresh();
    } catch {
      toast.error("Failed to adjust wallet");
    }
    setAdjustLoading(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Slot Information — {slot?.name}
            </DialogTitle>
          </DialogHeader>

          {slotInfo && (
            <Tabs value={detailTab} onValueChange={loadDetailTab}>
              <TabsList className="flex flex-wrap w-full gap-1">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="earnings">Earning History</TabsTrigger>
                <TabsTrigger value="distributed">Distributed Income</TabsTrigger>
                <TabsTrigger value="wallet">Wallet History</TabsTrigger>
                <TabsTrigger value="payout">Payout History</TabsTrigger>
                <TabsTrigger value="points">Points History</TabsTrigger>
                <TabsTrigger value="network">Network List</TabsTrigger>
                <TabsTrigger value="codevault">Codevault</TabsTrigger>
              </TabsList>

              <InformationTab
                slotInfo={slotInfo}
                setSlotInfo={setSlotInfo}
                membershipOptions={membershipOptions}
                countryList={countryList}
                onHistory={getHistorySlotCodeChanges}
                onCancel={() => onOpenChange(false)}
                onRefresh={onRefresh}
              />

              <DetailsTab
                slot={slot}
                active={detailTab === "details"}
                onRefresh={onRefresh}
                onClose={() => onOpenChange(false)}
              />

              <EarningsTab slot={slot} active={detailTab === "earnings"} />

              <DistributedTab slot={slot} active={detailTab === "distributed"} />

              <WalletTab
                slot={slot}
                active={detailTab === "wallet"}
                onAdjust={() => {
                  setAdjustId(String(slot?.slot_id ?? ""));
                  setAdjustCode(slot?.slot_no ?? "");
                  setAdjustOpen(true);
                }}
              />

              <PayoutTab slot={slot} active={detailTab === "payout"} />

              <PointsTab slot={slot} active={detailTab === "points"} />

              <NetworkTab slot={slot} active={detailTab === "network"} />

              <CodevaultTab slot={slot} active={detailTab === "codevault"} />
            </Tabs>
          )}

          {!slotInfo && <LoadingSpinner />}
        </DialogContent>
      </Dialog>

      {/* Username Changes History modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <History className="h-4 w-4 inline mr-1" /> Username Changes History
            </DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Old Username</TableHead>
                  <TableHead className="text-center">New Username</TableHead>
                  <TableHead className="text-center">Change By</TableHead>
                  <TableHead className="text-center">Date Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(slotCodeHistory?.data ?? []).length > 0 ? (
                  (slotCodeHistory.data ?? []).map((h: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-center">{h.old_slot_code}</TableCell>
                      <TableCell className="text-center">{h.new_slot_code}</TableCell>
                      <TableCell className="text-center">{h.name}</TableCell>
                      <TableCell className="text-center">{h.date_change}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No history
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Wallet modal */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Wallet className="h-4 w-4 inline mr-1" /> Adjust Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Slot ID</Label>
              <Input value={adjustId} onChange={(e) => setAdjustId(e.target.value)} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Slot No</Label>
              <Input value={adjustCode} onChange={(e) => setAdjustCode(e.target.value)} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Trigger</Label>
              <Input value={adjustTrigger} onChange={(e) => setAdjustTrigger(e.target.value)} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Currency</Label>
              <Select value={adjustCurrencyId} onValueChange={setAdjustCurrencyId}>
                <SelectTrigger className="text-center">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c: any) => (
                    <SelectItem key={c.currency_id} value={String(c.currency_id)}>
                      {c.currency_name} ({c.currency_abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 relative">
              <Label className="text-xs">PLAN</Label>
              <Input
                value={adjustPlan}
                onChange={(e) => setAdjustPlan(e.target.value)}
                placeholder="Enter Plan Name"
                className="text-center"
              />
              {/* simple dropdown suggestion list, filtered as you type */}
              {planList.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 max-h-[200px] overflow-y-auto">
                  {planList
                    .filter((p: any) => !adjustPlan || p.plan_name?.toLowerCase().includes(adjustPlan.toLowerCase()))
                    .map((p: any, i: number) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                        onClick={() => setAdjustPlan(p.plan_name)}
                      >
                        {p.plan_name}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Amount</Label>
              <Input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="text-center"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>
              Close
            </Button>
            <Button onClick={handleAdjustWallet} disabled={adjustLoading}>
              {adjustLoading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}