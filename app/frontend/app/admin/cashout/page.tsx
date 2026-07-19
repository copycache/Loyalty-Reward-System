"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowUpFromLine,
  CheckCircle,
  XCircle,
  PlayCircle,
  Eye,
  Settings,
  FileDown,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PayoutSchedule {
  schedule_id: number;
  schedule_date_from: string;
  schedule_date_to: string;
  schedule_status: string;
  cash_out_method_name: string;
  total_payout_amount: string | number;
  total_payout_charge: string | number;
  total_payout_required: string | number;
  total_payout_receivable: string | number;
  transactions?: any[];
}

interface PayoutTransaction {
  cash_out_id: number;
  cash_out_name: string;
  cash_out_slot_code: string;
  cash_out_amount_requested: string | number;
  cash_out_net_payout: string | number;
  cash_out_status: string;
  team_name?: string;
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  done: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function AdminPayoutPage() {
  const { token } = useAuthStore();
  const [schedules, setSchedules] = useState<PayoutSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [methods, setMethods] = useState<any[]>([]);

  // Process payout modal
  const [processOpen, setProcessOpen] = useState(false);
  const [processType, setProcessType] = useState("request_only");
  const [processMethod, setProcessMethod] = useState("");
  const [processLoading, setProcessLoading] = useState(false);

  // Schedule detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PayoutSchedule | null>(null);
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);
  const [txSearch, setTxSearch] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [payoutSettings, setPayoutSettings] = useState<any>(null);

  // Methods modal
  const [methodsOpen, setMethodsOpen] = useState(false);

  const loadSchedules = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const body: any = {};
      if (dateFrom) body.from = dateFrom;
      if (dateTo) body.to = dateTo;
      const res = await apiPost<any>("/api/cashout/get_schedules", body, token);
      setSchedules(res?.list?.data || (Array.isArray(res) ? res : (res?.data || [])));
    } catch (err: any) {
      console.error("Failed to load payout schedules:", err);
    }
    setLoading(false);
  }, [token, dateFrom, dateTo]);

  const loadMethods = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/cashout/get_method_list", {}, token);
      setMethods(Array.isArray(res) ? res : []);
    } catch { /* optional */ }
  }, [token]);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);
  useEffect(() => { loadMethods(); }, [loadMethods]);

  const openScheduleDetail = async (schedule: PayoutSchedule) => {
    setSelectedSchedule(schedule);
    setDetailOpen(true);
    setTxLoading(true);
    try {
      const res = await apiPost<any>(
        "/api/cashout/get_actual_schedule_transactions",
        { id: schedule.schedule_id },
        token
      );
      setTransactions(res?.list?.data || (Array.isArray(res) ? res : (res?.data || [])));
    } catch {
      setTransactions([]);
    }
    setTxLoading(false);
  };

  const handleProcessPayout = async () => {
    if (!token) return;
    setProcessLoading(true);
    try {
      await apiPost(
        "/api/cashout/process_payout",
        { cashout_type: processType, cashout_method_id: processMethod },
        token
      );
      toast.success("Payout processing started");
      setProcessOpen(false);
      loadSchedules();
    } catch (err: any) {
      toast.error(err.message || "Failed to process payout");
    }
    setProcessLoading(false);
  };

  const handleDonePayout = async (scheduleId: number) => {
    if (!token) return;
    if (!confirm("Mark all transactions in this schedule as done?")) return;
    try {
      await apiPost(
        "/api/cashout/process_transactions",
        { sched_id: scheduleId, type: "done" },
        token
      );
      toast.success("Payout marked as done");
      loadSchedules();
      setDetailOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to complete payout");
    }
  };

  const handleUpdateTransaction = async (txId: number, status: string) => {
    if (!token) return;
    try {
      await apiPost(
        "/api/cashout/update_transaction",
        { transaction: txId, message: status },
        token
      );
      toast.success("Transaction updated");
      if (selectedSchedule) openScheduleDetail(selectedSchedule);
    } catch (err: any) {
      toast.error(err.message || "Failed to update transaction");
    }
  };

  const openSettings = async () => {
    setSettingsOpen(true);
    try {
      const res = await apiPost<any>("/api/cashout/get_settings", {}, token);
      setPayoutSettings(res);
    } catch {
      setPayoutSettings(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payout Processing</h1>
          <p className="text-muted-foreground">
            Manage payout schedules and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMethodsOpen(true)}>
            Payout Methods
          </Button>
          <Button variant="outline" onClick={openSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setProcessOpen(true)}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Process Payout
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">From:</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">To:</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
            </div>
            <Button variant="outline" onClick={loadSchedules}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Start</TableHead>
                <TableHead>Date End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Payout Charge</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Receivable</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    No payout schedules found
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((s) => (
                  <TableRow key={s.schedule_id}>
                    <TableCell>{s.schedule_date_from || "—"}</TableCell>
                    <TableCell>{s.schedule_date_to || "—"}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[s.schedule_status] || statusColors.pending} hover:opacity-90`}>
                        {s.schedule_status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{s.cash_out_method_name || "—"}</TableCell>
                    <TableCell>₱{s.total_payout_amount}</TableCell>
                    <TableCell>₱{s.total_payout_charge}</TableCell>
                    <TableCell>₱{s.total_payout_required}</TableCell>
                    <TableCell className="font-medium">₱{s.total_payout_receivable}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openScheduleDetail(s)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Process Payout Modal */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={processType} onValueChange={setProcessType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="request_only">Only Payout Requests</SelectItem>
                  <SelectItem value="all_wallet">All Member&apos;s Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cashout Method</Label>
              <Select value={processMethod} onValueChange={setProcessMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((m: any) => (
                    <SelectItem key={m.cash_out_method_id} value={String(m.cash_out_method_id)}>
                      {m.cash_out_method_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayout} disabled={processLoading || !processMethod}>
              {processLoading ? "Processing..." : "Start Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5" />
              Payout Schedule — {selectedSchedule?.schedule_date_from} to {selectedSchedule?.schedule_date_to}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {selectedSchedule && selectedSchedule.schedule_status !== "done" && (
                <Button onClick={() => handleDonePayout(selectedSchedule.schedule_id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Done Payout
                </Button>
              )}
            </div>
          </div>

          {txLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Receivable</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions
                  .filter(
                    (t) =>
                      !txSearch ||
                      t.cash_out_name?.toLowerCase().includes(txSearch.toLowerCase()) ||
                      t.cash_out_slot_code?.toLowerCase().includes(txSearch.toLowerCase())
                  )
                  .map((t) => (
                    <TableRow key={t.cash_out_id}>
                      <TableCell>{t.cash_out_name || "—"}</TableCell>
                      <TableCell className="font-medium">{t.cash_out_slot_code || "—"}</TableCell>
                      <TableCell>₱{t.cash_out_amount_requested}</TableCell>
                      <TableCell>₱{t.cash_out_withholding_tax || "0"}</TableCell>
                      <TableCell>₱{t.cash_out_amount_requested}</TableCell>
                      <TableCell className="font-medium">₱{t.cash_out_net_payout}</TableCell>
                      <TableCell>{t.cash_out_method_name || "—"}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[t.cash_out_status] || statusColors.pending} hover:opacity-90`}>
                          {t.cash_out_status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {t.cash_out_status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateTransaction(t.cash_out_id, "completed")}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateTransaction(t.cash_out_id, "rejected")}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No transactions in this schedule
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Payout Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payout Settings</DialogTitle>
          </DialogHeader>
          {payoutSettings ? (
            <div className="space-y-4">
              {Object.entries(payoutSettings).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">
                    {key.replace(/_/g, " ")}
                  </Label>
                  <p className="text-sm font-medium">{String(value ?? "—")}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payout Methods Modal */}
      <Dialog open={methodsOpen} onOpenChange={setMethodsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payout Methods</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Service Charge</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.length > 0 ? (
                methods.map((m: any) => (
                  <TableRow key={m.cash_out_method_id}>
                    <TableCell>{m.cash_out_method_category || "—"}</TableCell>
                    <TableCell>{m.cash_out_method_name || "—"}</TableCell>
                    <TableCell>{m.cash_out_method_currency || "PHP"}</TableCell>
                    <TableCell>{m.cash_out_method_method_fee || "0"}</TableCell>
                    <TableCell>{m.cash_out_method_service_charge || "0"}</TableCell>
                    <TableCell>{m.cash_out_method_withholding_tax || "0"}</TableCell>
                    <TableCell>
                      <Badge className={!m.is_archived ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {!m.is_archived ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No methods configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
