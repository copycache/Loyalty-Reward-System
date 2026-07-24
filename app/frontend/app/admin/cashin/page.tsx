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
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowDownToLine,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface CashInTransaction {
  cash_in_id: number;
  cash_in_slot_code: string;
  cash_in_member_name: string;
  cash_in_method_name: string;
  cash_in_currency: string;
  cash_in_receivable: string | number;
  cash_in_charge: string | number;
  cash_in_status: string;
  cash_in_member_receive: string | number;
  cash_in_date: string;
  cash_in_proof_of_payment?: string;
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

export default function AdminCashInPage() {
  const { token } = useAuthStore();
  const [transactions, setTransactions] = useState<CashInTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [methods, setMethods] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const queryString = new URLSearchParams({ cash_in_owner: search, cash_in_method_id: methodFilter, cash_in_currency: currencyFilter, cash_in_status: statusFilter, cash_in_date_from: dateFrom, cash_in_date_to: dateTo }).toString();

  // Process modal
  const [processOpen, setProcessOpen] = useState(false);
  const [processItem, setProcessItem] = useState<CashInTransaction | null>(null);
  const [processAmount, setProcessAmount] = useState("");
  const [processLoading, setProcessLoading] = useState(false);

  // Methods management modal
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [methodCategories, setMethodCategories] = useState<any[]>([]);

  const loadTransactions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const body: any = {};
      if (statusFilter) body.cash_in_status = statusFilter;
      if (search) body.cash_in_owner = search;
      if (methodFilter) body.cash_in_method_id = methodFilter;
      if (currencyFilter) body.cash_in_currency = currencyFilter;
      if (dateFrom) body.cash_in_date_from = dateFrom;
      if (dateTo) body.cash_in_date_to = dateTo;

      const res = await apiPost<any>("/api/cashin/get_transactions", body, token);
      if (res?.data) {
        setTransactions(res.data);
        setTotalPages(res.last_page || 1);
        setTotal(res.total || res.data.length);
      } else if (Array.isArray(res)) {
        setTransactions(res);
        setTotalPages(1);
        setTotal(res.length);
      } else {
        setTransactions([]);
      }
    } catch (err: any) {
      console.error("Failed to load cash-in transactions:", err);
    }
    setLoading(false);
  }, [token, page, search, statusFilter, methodFilter, dateFrom, dateTo]);

  const loadMethods = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/cashin/get_method_list", {}, token);
      setMethods(Array.isArray(res) ? res : []);
    } catch { /* optional */ }
  }, [token]);

  const loadCurrencies = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/cashin/get_currency", {}, token);
      setCurrencies(Array.isArray(res) ? res : []);
    } catch { /* optional */ }
  }, [token]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);
  useEffect(() => { loadMethods(); loadCurrencies(); }, [loadMethods, loadCurrencies]);

  const openProcess = (item: CashInTransaction) => {
    setProcessItem(item);
    setProcessAmount(String(item.cash_in_receivable));
    setProcessOpen(true);
  };

  const handleProcess = async (action: "approved" | "rejected") => {
    if (!token || !processItem) return;
    setProcessLoading(true);
    try {
      await apiPost(
        "/api/cashin/process_transaction",
        {
          proof_id: processItem.cash_in_proof_id || processItem.cash_in_id,
          process: action,
        },
        token
      );
      toast.success(
        action === "approved" ? "Transaction approved" : "Transaction rejected"
      );
      setProcessOpen(false);
      loadTransactions();
    } catch (err: any) {
      toast.error(err.message || "Failed to process transaction");
    }
    setProcessLoading(false);
  };

  const handleProcessAll = async () => {
    if (!token) return;
    if (!confirm("Process all pending cash-in transactions?")) return;
    try {
      await apiPost("/api/cashin/process_all_transaction", {}, token);
      toast.success("All pending transactions processed");
      loadTransactions();
    } catch (err: any) {
      toast.error(err.message || "Failed to process all");
    }
  };

  const openMethodsManagement = async () => {
    setMethodsOpen(true);
    try {
      const cats = await apiPost<any>(
        "/api/cashin/get_method_category_list",
        {},
        token
      );
      setMethodCategories(Array.isArray(cats) ? cats : []);
    } catch { /* optional */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cash In Processing</h1>
          <p className="text-muted-foreground">
            Manage cash-in transactions ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/export/cashin/csv?${queryString}`} target="_blank"
            className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-accent">
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Export as CSV
          </a>
          <a href={`/api/export/cashin/pdf?${queryString}`} target="_blank"
            className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-accent">
            <FileText className="h-4 w-4 mr-2" /> Export as PDF
          </a>
          <Button variant="outline" onClick={openMethodsManagement}>
            Cash-In Methods
          </Button>
          <Button onClick={handleProcessAll}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Process All Pending
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <form
              onSubmit={(e) => { e.preventDefault(); setPage(1); loadTransactions(); }}
              className="flex gap-2 flex-1 min-w-[250px]"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currencyFilter || "all"} onValueChange={(v) => setCurrencyFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                {currencies.map((c: any, i: number) => (
                  <SelectItem key={i} value={c.currency_abbreviation}>{c.currency_abbreviation}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={methodFilter || "all"} onValueChange={(v) => setMethodFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {methods.map((m: any) => (
                  <SelectItem key={m.cash_in_method_id} value={String(m.cash_in_method_id)}>
                    {m.cash_in_method_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">From:</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">To:</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
            </div>

            <Button variant="outline" onClick={() => { setPage(1); loadTransactions(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Charge</TableHead>
                <TableHead>Receive</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                    No cash-in transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.cash_in_id}>
                    <TableCell className="font-medium">{t.cash_in_slot_code || "—"}</TableCell>
                    <TableCell>{t.cash_in_member_name || "—"}</TableCell>
                    <TableCell>{t.cash_in_method_name || "—"}</TableCell>
                    <TableCell>{t.cash_in_currency || "PHP"}</TableCell>
                    <TableCell>₱{t.cash_in_receivable}</TableCell>
                    <TableCell>₱{t.cash_in_charge || "0"}</TableCell>
                    <TableCell className="font-medium">₱{t.cash_in_member_receive || "0"}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[t.cash_in_status] || statusColors.pending} hover:opacity-90`}>
                        {t.cash_in_status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.cash_in_date ? new Date(t.cash_in_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {t.cash_in_status === "pending" && (
                        <Button variant="ghost" size="sm" onClick={() => openProcess(t)}>
                          <ArrowDownToLine className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
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

      {/* Process Transaction Modal */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Cash-In Transaction</DialogTitle>
          </DialogHeader>
          {processItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Slot Code</Label>
                  <p className="text-sm font-medium">{processItem.cash_in_slot_code}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Member Name</Label>
                  <p className="text-sm font-medium">{processItem.cash_in_member_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Method</Label>
                  <p className="text-sm">{processItem.cash_in_method_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Original Amount</Label>
                  <p className="text-sm font-medium">₱{processItem.cash_in_receivable}</p>
                </div>
              </div>
              {processItem.cash_in_proof_of_payment && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Proof of Payment</Label>
                  <img
                    src={processItem.cash_in_proof_of_payment}
                    alt="Proof"
                    className="max-w-full max-h-64 rounded border"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Amount to Credit</Label>
                <Input
                  type="number"
                  value={processAmount}
                  onChange={(e) => setProcessAmount(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setProcessOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleProcess("rejected")}
              disabled={processLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleProcess("approved")}
              disabled={processLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Methods Management Modal */}
      <Dialog open={methodsOpen} onOpenChange={setMethodsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cash-In Methods</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            <select className="h-10 rounded-md border px-3 text-sm flex-1" value={methodFilter || "all"} onChange={(e) => setMethodFilter(e.target.value === "all" ? "" : e.target.value)}>
              <option value="all">All Categories</option>
              {methodCategories.map((c: any, i: number) => (
                <option key={i} value={c.cash_in_method_category}>{c.cash_in_method_category}</option>
              ))}
            </select>
            <select className="h-10 rounded-md border px-3 text-sm flex-1" value={currencyFilter || "all"} onChange={(e) => setCurrencyFilter(e.target.value === "all" ? "" : e.target.value)}>
              <option value="all">All Currencies</option>
              {currencies.map((c: any, i: number) => (
                <option key={i} value={c.currency_abbreviation}>{c.currency_abbreviation}</option>
              ))}
            </select>
            <Button size="sm">Add Method</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Method Name</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Charge (Fixed)</TableHead>
                <TableHead className="text-right">Charge (%)</TableHead>
                <TableHead className="text-right">Service Charge</TableHead>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.length > 0 ? (
                methods.map((m: any) => (
                  <TableRow key={m.cash_in_method_id}>
                    <TableCell>{m.cash_in_method_category || "—"}</TableCell>
                    <TableCell>{m.cash_in_method_name || "—"}</TableCell>
                    <TableCell>{m.cash_in_method_currency || "PHP"}</TableCell>
                    <TableCell className="text-right">{m.cash_in_charge_fixed || "0"}</TableCell>
                    <TableCell className="text-right">{m.cash_in_charge_percentage || "0"}</TableCell>
                    <TableCell className="text-right">{m.cash_in_service_charge || "0"}</TableCell>
                    <TableCell>{m.cash_in_method_thumbnail ? <img src={m.cash_in_method_thumbnail} className="h-8 w-8 object-contain" /> : "—"}</TableCell>
                    <TableCell>
                      <Badge className={!m.is_archived ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {!m.is_archived ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No methods configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMethodsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
