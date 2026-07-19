"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Wallet,
  ArrowUpDown,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SlotItem {
  slot_id: number;
  slot_no: string;
  name: string;
  email: string;
  membership_name?: string;
  wallet?: number;
  cashin?: number;
  earning?: number;
  voucher_wallet?: number;
}

export default function AdminWalletPage() {
  const { token } = useAuthStore();
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Adjust wallet modal
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustSlot, setAdjustSlot] = useState<SlotItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState("add");
  const [adjustDetails, setAdjustDetails] = useState("");
  const [planList, setPlanList] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Wallet history modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySlot, setHistorySlot] = useState<SlotItem | null>(null);
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadSlots = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiPost<any>("/api/slot/get_full", { page, search }, token);
      if (res?.data) {
        setSlots(res.data);
        setTotalPages(res.last_page || 1);
        setTotal(res.total || 0);
      } else if (Array.isArray(res)) {
        setSlots(res);
        setTotalPages(1);
        setTotal(res.length);
      } else {
        setSlots([]);
      }
    } catch (err: any) {
      console.error("Failed to load slots:", err);
    }
    setLoading(false);
  }, [token, page, search]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const openAdjustWallet = async (slot: SlotItem) => {
    setAdjustSlot(slot);
    setAdjustAmount("");
    setAdjustType("add");
    setAdjustDetails("");
    setSelectedPlan("");
    setAdjustOpen(true);

    try {
      const res = await apiPost<any>("/api/member/get_plan_list", {}, token);
      setPlanList(Array.isArray(res) ? res : []);
    } catch {
      setPlanList([]);
    }
  };

  const handleAdjustWallet = async () => {
    if (!token || !adjustSlot || !adjustAmount) return;
    setAdjustLoading(true);
    try {
      const amount = adjustType === "add" ? Math.abs(Number(adjustAmount)) : -Math.abs(Number(adjustAmount));
      const body: any = {
        slot_id: adjustSlot.slot_id,
        amount,
        plan: selectedPlan || "MANUAL_ADJUSTMENT",
        trigger: adjustDetails || (adjustType === "add" ? "Admin Wallet Addition" : "Admin Wallet Deduction"),
      };

      const res = await apiPost<any>("/api/member/adjust_wallet", body, token);
      if (res?.status === "success" || res?.status_code === 201) {
        toast.success("Wallet adjusted successfully");
        setAdjustOpen(false);
        loadSlots();
      } else {
        toast.error(res?.status_message || "Failed to adjust wallet");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust wallet");
    }
    setAdjustLoading(false);
  };

  const openWalletHistory = async (slot: SlotItem) => {
    setHistorySlot(slot);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await apiPost<any>("/api/member/get_slot_wallet", { id: slot.slot_id }, token);
      if (res?.data) {
        setWalletHistory(res.data);
      } else if (Array.isArray(res)) {
        setWalletHistory(res);
      } else {
        setWalletHistory([]);
      }
    } catch {
      setWalletHistory([]);
    }
    setHistoryLoading(false);
  };

  // Wallet summary figures
  const totalWallet = slots.reduce((sum, s) => sum + Number(s.wallet || 0), 0);
  const totalCashin = slots.reduce((sum, s) => sum + Number(s.cashin || 0), 0);
  const totalEarning = slots.reduce((sum, s) => sum + Number(s.earning || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet Management</h1>
        <p className="text-muted-foreground">
          View and adjust member wallet balances
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Wallet (Page)</p>
                <p className="text-xl font-bold">₱{totalWallet.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <PlusCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cash-In (Page)</p>
                <p className="text-xl font-bold">₱{totalCashin.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowUpDown className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings (Page)</p>
                <p className="text-xl font-bold">₱{totalEarning.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => { e.preventDefault(); setPage(1); loadSlots(); }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            <Button variant="outline" onClick={() => { setPage(1); loadSlots(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Wallet Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot No</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Cash-In</TableHead>
                <TableHead>Voucher Wallet</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                  </TableCell>
                </TableRow>
              ) : slots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    No slots found
                  </TableCell>
                </TableRow>
              ) : (
                slots.map((s) => (
                  <TableRow key={s.slot_id}>
                    <TableCell className="font-mono">{s.slot_no || "—"}</TableCell>
                    <TableCell className="font-medium">{s.email || "—"}</TableCell>
                    <TableCell>{s.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.membership_name || "—"}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">₱{Number(s.wallet || 0).toLocaleString()}</TableCell>
                    <TableCell>₱{Number(s.cashin || 0).toLocaleString()}</TableCell>
                    <TableCell>₱{Number(s.voucher_wallet || 0).toLocaleString()}</TableCell>
                    <TableCell>₱{Number(s.earning || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openAdjustWallet(s)} title="Adjust Wallet">
                        <ArrowUpDown className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openWalletHistory(s)} title="View History">
                        <Wallet className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} total)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjust Wallet Modal */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Wallet — {adjustSlot?.slot_no}</DialogTitle>
          </DialogHeader>
          {adjustSlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Current Balance</Label>
                  <p className="text-lg font-bold">₱{Number(adjustSlot.wallet || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Slot No</Label>
                  <p className="text-sm font-mono">{adjustSlot.slot_no}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={adjustType} onValueChange={setAdjustType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add (+)</SelectItem>
                    <SelectItem value="subtract">Subtract (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>

              {planList.length > 0 && (
                <div className="space-y-2">
                  <Label>Plan Type</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {planList.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name || p.plan_name || p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Details / Remarks</Label>
                <Input
                  placeholder="Reason for adjustment..."
                  value={adjustDetails}
                  onChange={(e) => setAdjustDetails(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustWallet} disabled={adjustLoading || !adjustAmount}>
              {adjustLoading ? "Processing..." : adjustType === "add" ? "Add to Wallet" : "Subtract from Wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wallet History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Wallet History — {historySlot?.slot_no}</DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletHistory.length > 0 ? (
                  walletHistory.map((h: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{h.details || h.description || "—"}</TableCell>
                      <TableCell className={Number(h.amount) >= 0 ? "text-green-600" : "text-red-600"}>
                        {Number(h.amount) >= 0 ? "+" : ""}₱{Number(h.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>₱{Number(h.balance || h.running_balance || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {h.date || h.created_at || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No wallet history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
