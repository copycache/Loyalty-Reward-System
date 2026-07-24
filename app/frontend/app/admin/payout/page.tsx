"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  FileText,
  Settings,
  CreditCard,
  RefreshCw,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  ArrowUpDown,
  DollarSign,
  FileUp,
  Save,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminPayoutPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [page, setPage] = useState(1);
  const [schedules, setSchedules] = useState<any>(null);
  const [scheduleDetails, setScheduleDetails] = useState<any>(null);
  const [scheduleTransactions, setScheduleTransactions] = useState<any>(null);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [viewDetails, setViewDetails] = useState<any>(null);
  const [editMessage, setEditMessage] = useState(false);
  const [submitProcess, setSubmitProcess] = useState("false");
  const [cashoutDetails, setCashoutDetails] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [methodList, setMethodList] = useState<any>(null);

  const [processOpen, setProcessOpen] = useState(false);
  const [payoutData, setPayoutData] = useState<any>({ cashout_type: "request", cashout_method_id: "0" });
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const sumTotal = { payout: 0, charge: 0, required: 0, receivable: 0, net: 0 };

  const loadSchedules = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiPost<any>("/api/admin/payout/schedules", {
        page, from: filterFrom || undefined, to: filterTo || undefined,
      }, token);
      setSchedules(res);
    } catch { toast.error("Failed to load schedules"); }
    setLoading(false);
  }, [token, page, filterFrom, filterTo]);

  const loadMethodList = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/admin/payout/methods", {}, token);
      setMethodList(res);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    loadSchedules();
    loadMethodList();
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/branch/cashier/load_company_info", {}, token);
      setCompanyInfo(res);
    } catch { /* ignore */ }
  };

  const loadScheduleTransactions = async (scheduleId: number) => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/admin/payout/schedule-transactions", { schedule_id: scheduleId }, token);
      setScheduleTransactions(res);
    } catch { toast.error("Failed to load transactions"); }
  };

  const getScheduleById = async (scheduleId: number) => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/admin/payout/schedule-detail", { schedule_id: scheduleId }, token);
      setScheduleDetails(res);
    } catch { toast.error("Failed to load schedule"); }
  };

  const updateTransaction = async (cashOutId: number, scheduleId: number, amount: any, message: any, sender?: string, control?: string, receipt?: string) => {
    if (!token) return;
    try {
      await apiPost("/api/admin/payout/update-transaction", {
        cash_out_id: cashOutId, schedule_id: scheduleId,
        cash_out_amount_requested: amount, cash_out_method_message: message,
        sender_name: sender, control_number: control, receipt_thumbnail: receipt,
      }, token);
    } catch { /* ignore */ }
  };

  const processPayout = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/admin/payout/process", payoutData, token);
      toast.success("Payout processing started");
      setProcessOpen(false);
      loadSchedules();
    } catch { toast.error("Failed"); }
    setSubmitted(false);
  };

  const openSchedule = async (sched: any, i: number) => {
    setScheduleDetails(sched);
    setEditMessage(false);
    await loadScheduleTransactions(sched.schedule_id);
    setScheduleOpen(true);
  };

  if (loading && !schedules) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const schedData = schedules?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payout Processing</h1>
          <p className="text-muted-foreground">Manage Payout of Members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <FileUp className="h-4 w-4 mr-2" /> Import Payout
          </Button>
          <Button variant="outline" onClick={() => { loadMethodList(); setSettingsOpen(true); }}>
            <Settings className="h-4 w-4 mr-2" /> Payout Settings
          </Button>
          <Button variant="outline" onClick={() => setConfigOpen(true)}>
            <ArrowUpDown className="h-4 w-4 mr-2" /> Payout Config
          </Button>
          {schedules && (
            <a href={`/api/export/payout/xls?${new URLSearchParams({ from: filterFrom, to: filterTo }).toString()}`}
              target="_blank" className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-accent">
              <Download className="h-4 w-4 mr-2" /> Export Payout
            </a>
          )}
          <Button onClick={() => setProcessOpen(true)}>
            <CreditCard className="h-4 w-4 mr-2" /> Process Payout
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">Filter From</Label>
              <Input type="date" value={filterFrom} onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Filter To</Label>
              <Input type="date" value={filterTo} onChange={(e) => { setFilterTo(e.target.value); setPage(1); }} />
            </div>
            <Button variant="outline" size="icon" className="mt-auto" onClick={loadSchedules}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Start</TableHead>
                  <TableHead>Date End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cashout Method</TableHead>
                  <TableHead className="text-right">Payout Gross Amount</TableHead>
                  <TableHead className="text-right">Payout Charge</TableHead>
                  <TableHead className="text-right">Payout Required</TableHead>
                  <TableHead className="text-right">Payout Receivable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      No schedules found
                    </TableCell>
                  </TableRow>
                ) : (
                  schedData.map((sched: any, i: number) => {
                    sumTotal.payout += Number(sched.total_payout_amount) || 0;
                    sumTotal.charge += Number(sched.total_payout_charge) || 0;
                    sumTotal.required += Number(sched.total_payout_required) || 0;
                    sumTotal.receivable += Number(sched.total_payout_receivable) || 0;
                    return (
                      <TableRow key={sched.schedule_id} className="cursor-pointer hover:bg-muted/50" onClick={() => openSchedule(sched, i)}>
                        <TableCell>{new Date(sched.schedule_date_from).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(sched.schedule_date_to).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={sched.schedule_status === "processed" ? "default" : sched.schedule_status === "processing" ? "secondary" : "outline"}
                            className={
                              sched.schedule_status === "processed" ? "bg-green-100 text-green-800" :
                              sched.schedule_status === "processing" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                            {sched.schedule_status?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{sched.cash_out_method_name || "All"}</TableCell>
                        <TableCell className="text-right">{(Number(sched.total_payout_amount) || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{(Number(sched.total_payout_charge) || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{(Number(sched.total_payout_required) || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right font-bold">{(Number(sched.total_payout_receivable) || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
              {schedData.length > 0 && (
                <tfoot>
                  <TableRow className="font-bold">
                    <TableCell colSpan={4}></TableCell>
                    <TableCell className="text-right">{sumTotal.payout.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{sumTotal.charge.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{sumTotal.required.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-blue-600">{sumTotal.receivable.toFixed(2)}</TableCell>
                  </TableRow>
                </tfoot>
              )}
            </Table>
          </div>

          {schedules?.last_page > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {schedules.current_page} of {schedules.last_page}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= (schedules.last_page || 1)} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Payout Modal */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><CreditCard className="h-5 w-5 inline mr-2" />Process Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What would you like to process?</Label>
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={payoutData.cashout_type} onChange={(e) => setPayoutData((prev: any) => ({ ...prev, cashout_type: e.target.value }))}>
                <option value="request">Only Payout Request</option>
                <option value="members_wallet">All of Member's Wallet</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={payoutData.cashout_method_id} onChange={(e) => setPayoutData((prev: any) => ({ ...prev, cashout_method_id: e.target.value }))}>
                <option value="0">All</option>
                {(methodList?.method || []).map((m: any) => (
                  <option key={m.cash_out_method_id} value={m.cash_out_method_id}>{m.cash_out_method_name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessOpen(false)}>Close</Button>
            <Button onClick={processPayout} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing</> : <><CheckCircle className="h-4 w-4 mr-2" /> Process Payout</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Details Modal */}
      <Dialog open={scheduleOpen} onOpenChange={(o) => { if (!o) { setScheduleOpen(false); setViewDetails(null); } }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <DollarSign className="h-5 w-5 inline mr-2" />
              Payout List ({scheduleDetails ? `${new Date(scheduleDetails.schedule_date_from).toLocaleDateString()} - ${new Date(scheduleDetails.schedule_date_to).toLocaleDateString()}` : ""})
            </DialogTitle>
          </DialogHeader>
          {scheduleDetails && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {scheduleDetails.schedule_status !== "pending" && (
                    <Input className="w-64" placeholder="Search Name or Username."
                      value={scheduleTransactions?.search || ""} onChange={(e) => {
                        const upd = { ...scheduleTransactions, search: e.target.value };
                        setScheduleTransactions(upd);
                      }} />
                  )}
                </div>
                <div className="flex gap-2">
                  <a href={`/api/export/payout_schedule/csv?schedule_id=${scheduleDetails.schedule_id}`}
                    target="_blank" className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-accent">
                    <FileSpreadsheet className="h-4 w-4 mr-2" /> Export Payout Details
                  </a>
                  {scheduleDetails.schedule_status === "processed" && !editMessage && submitProcess === "false" && (
                    <Button size="sm" onClick={() => setEditMessage(true)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Edit Messages
                    </Button>
                  )}
                  {scheduleDetails.schedule_status === "processing" && submitProcess === "false" && (
                    <>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        setSubmitProcess("true");
                        try {
                          await apiPost("/api/admin/payout/reject-all", { schedule_id: scheduleDetails.schedule_id }, token!);
                          toast.success("All rejected");
                          await loadScheduleTransactions(scheduleDetails.schedule_id);
                        } catch { toast.error("Failed"); }
                        setSubmitProcess("false");
                      }}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject All
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => {
                        setSubmitProcess("true");
                        try {
                          await apiPost("/api/admin/payout/done", { schedule_id: scheduleDetails.schedule_id }, token!);
                          toast.success("Payout completed");
                          setScheduleOpen(false);
                          loadSchedules();
                        } catch { toast.error("Failed"); }
                        setSubmitProcess("false");
                      }}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Done Payout
                      </Button>
                    </>
                  )}
                  {submitProcess === "true" && (
                    <Button size="sm" disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing</Button>
                  )}
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Member Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead className="text-right">Gross Payout</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead>Sender Name</TableHead>
                      <TableHead>Control No.</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead className="text-right">Required Amount</TableHead>
                      <TableHead className="text-right">Receivable Amount</TableHead>
                      <TableHead className="text-right">Savings</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!scheduleTransactions?.data || scheduleTransactions.data.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center p-4">
                          {scheduleDetails.schedule_status !== "processed"
                            ? `This schedule is still ${scheduleDetails.schedule_status}. No transactions found.`
                            : <span className="text-green-600 font-bold">Processed</span>}
                        </TableCell>
                      </TableRow>
                    ) : (
                      scheduleTransactions.data.map((tx: any, i: number) => (
                        <TableRow key={tx.cash_out_id || i} className="hover:bg-muted/50">
                          <TableCell>
                            {scheduleDetails.schedule_status === "processing" && submitProcess === "false" && (
                              <Button size="sm" variant="destructive" className="h-7 w-7 p-0"
                                onClick={() => updateTransaction(tx.cash_out_id, scheduleDetails.schedule_id, 0, tx.cash_out_method_message)}>
                                <XCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>{tx.cash_out_name}</TableCell>
                          <TableCell>{tx.cash_out_slot_code}</TableCell>
                          <TableCell className="text-right">
                            {scheduleDetails.schedule_status === "processing" ? (
                              <Input type="number" className="w-24 text-right h-8 text-sm"
                                value={tx.cash_out_amount_requested || 0}
                                onChange={(e) => {
                                  const upd = { ...tx, cash_out_amount_requested: e.target.value };
                                  const data = [...scheduleTransactions.data];
                                  data[i] = upd;
                                  setScheduleTransactions((prev: any) => ({ ...prev, data }));
                                  updateTransaction(tx.cash_out_id, scheduleDetails.schedule_id, e.target.value, tx.cash_out_method_message, tx.sender_name, tx.control_number);
                                }} />
                            ) : (
                              (Number(tx.cash_out_amount_requested) || 0).toFixed(2)
                            )}
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            {tx.cash_out_amount_requested == 0 ? 0 : (Number(tx.cash_out_method_tax) || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {scheduleDetails.schedule_status === "processing" ? (
                              <Input className="w-24 h-8 text-sm"
                                value={tx.sender_name || ""}
                                onChange={(e) => {
                                  const upd = { ...tx, sender_name: e.target.value };
                                  const data = [...scheduleTransactions.data];
                                  data[i] = upd;
                                  setScheduleTransactions((prev: any) => ({ ...prev, data }));
                                  updateTransaction(tx.cash_out_id, scheduleDetails.schedule_id, tx.cash_out_amount_requested, tx.cash_out_method_message, e.target.value, tx.control_number);
                                }} />
                            ) : editMessage ? (
                              <Input className="w-24 h-8 text-sm"
                                value={tx.sender_name || ""}
                                onChange={(e) => {
                                  const upd = { ...tx, sender_name: e.target.value };
                                  const data = [...scheduleTransactions.data];
                                  data[i] = upd;
                                  setScheduleTransactions((prev: any) => ({ ...prev, data }));
                                }} />
                            ) : (
                              tx.sender_name
                            )}
                          </TableCell>
                          <TableCell>
                            {scheduleDetails.schedule_status === "processing" ? (
                              <Input className="w-24 h-8 text-sm"
                                value={tx.control_number || ""}
                                onChange={(e) => {
                                  const upd = { ...tx, control_number: e.target.value };
                                  const data = [...scheduleTransactions.data];
                                  data[i] = upd;
                                  setScheduleTransactions((prev: any) => ({ ...prev, data }));
                                  updateTransaction(tx.cash_out_id, scheduleDetails.schedule_id, tx.cash_out_amount_requested, tx.cash_out_method_message, tx.sender_name, e.target.value);
                                }} />
                            ) : editMessage ? (
                              <Input className="w-24 h-8 text-sm"
                                value={tx.control_number || ""}
                                onChange={(e) => {
                                  const upd = { ...tx, control_number: e.target.value };
                                  const data = [...scheduleTransactions.data];
                                  data[i] = upd;
                                  setScheduleTransactions((prev: any) => ({ ...prev, data }));
                                }} />
                            ) : (
                              tx.control_number
                            )}
                          </TableCell>
                          <TableCell>
                            {scheduleDetails.schedule_status === "processing" ? (
                              <Input className="w-24 h-8 text-sm"
                                value={tx.cash_out_method_message || ""}
                                onChange={(e) => {
                                  const upd = { ...tx, cash_out_method_message: e.target.value };
                                  const data = [...scheduleTransactions.data];
                                  data[i] = upd;
                                  setScheduleTransactions((prev: any) => ({ ...prev, data }));
                                  updateTransaction(tx.cash_out_id, scheduleDetails.schedule_id, tx.cash_out_amount_requested, e.target.value, tx.sender_name, tx.control_number);
                                }} />
                            ) : editMessage ? (
                              <Input className="w-24 h-8 text-sm"
                                value={tx.cash_out_method_message || ""}
                                onChange={(e) => {
                                  const upd = { ...tx, cash_out_method_message: e.target.value };
                                  const data = [...scheduleTransactions.data];
                                  data[i] = upd;
                                  setScheduleTransactions((prev: any) => ({ ...prev, data }));
                                }} />
                            ) : (
                              tx.cash_out_method_message
                            )}
                          </TableCell>
                          <TableCell>
                            {tx?.receipt_thumbnail ? (
                              <div className="flex items-center gap-1 text-sm">
                                <span>1 Attachment</span>
                                <a href={tx.receipt_thumbnail} target="_blank">
                                  <Eye className="h-3 w-3 text-blue-500" />
                                </a>
                              </div>
                            ) : (
                              scheduleDetails.schedule_status === "processing" && (
                                <Button size="sm" variant="outline" className="h-7 text-xs">
                                  <Upload className="h-3 w-3 mr-1" /> Upload
                                </Button>
                              )
                            )}
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            {(Number(tx.cash_out_net_payout_actual) || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            {(Number(tx.cash_out_net_payout) || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            {(Number(tx.cash_out_savings) || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className={`align-middle font-semibold ${tx.cash_out_status === "REJECTED" ? "text-red-600" : "text-green-600"}`}>
                            {tx.cash_out_status || "PENDING"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  {scheduleTransactions?.data?.length > 0 && (
                    <tfoot>
                      <TableRow className="font-bold">
                        <TableHead colSpan={9}></TableHead>
                        <TableHead className="text-right text-blue-600">
                          {(scheduleTransactions.data || []).reduce((s: number, t: any) => s + (Number(t.cash_out_net_payout_actual) || 0), 0).toFixed(2)}
                        </TableHead>
                        <TableHead colSpan={3}></TableHead>
                      </TableRow>
                    </tfoot>
                  )}
                </Table>
              </div>

              {viewDetails && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Method</TableHead>
                        <TableHead>Primary Info</TableHead>
                        <TableHead>Secondary Info</TableHead>
                        <TableHead>Optional</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>{viewDetails.cash_out_method_name || "No given data."}</TableCell>
                        <TableCell>{viewDetails.cash_out_primary_info || "No given data."}</TableCell>
                        <TableCell>{viewDetails.cash_out_secondary_info || "No given data."}</TableCell>
                        <TableCell>{viewDetails.cash_out_optional_info || "No given data."}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setScheduleOpen(false); setViewDetails(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Payout Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><FileUp className="h-5 w-5 inline mr-2" />Import Payout Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Upload Excel File</Label>
            <Input type="file" accept=".xlsx,.xls,.csv" />
            <p className="text-sm text-muted-foreground">Upload a payout schedule file (.xlsx, .xls, .csv)</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Close</Button>
            <Button>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><Settings className="h-5 w-5 inline mr-2" />Payout Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Payout Amount</Label>
              <Input type="number" placeholder="e.g. 500" />
            </div>
            <div className="space-y-2">
              <Label>Payout Schedule Type</Label>
              <select className="w-full h-10 rounded-md border px-3 text-sm">
                <option value="auto">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Close</Button>
            <Button><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Config Modal */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><Settings className="h-5 w-5 inline mr-2" />Payout Config</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payout Methods</Label>
              {(methodList?.method || []).map((m: any) => (
                <div key={m.cash_out_method_id} className="flex items-center justify-between py-1">
                  <span className="text-sm">{m.cash_out_method_name}</span>
                  <Badge variant="outline">{m.currency || "PHP"}</Badge>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
