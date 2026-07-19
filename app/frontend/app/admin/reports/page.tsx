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
  FileDown,
  Printer,
  FileText,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const REPORT_TYPES = [
  { key: "salesReport", label: "Sales Report" },
  { key: "codeTransferReport", label: "Code Transfer Report" },
  { key: "topSellerReport", label: "Item Purchased Report" },
  { key: "adjustWalletReport", label: "Adjust Wallet Report" },
  { key: "membersDetailReport", label: "Members Detail Report" },
];

export default function AdminReportsPage() {
  const { token } = useAuthStore();
  const [reportType, setReportType] = useState("salesReport");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState("");

  // Receipt modal
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Quote request modal
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteData, setQuoteData] = useState<any[]>([]);

  const loadBranches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/report/get_branch", {}, token);
      setBranches(Array.isArray(res) ? res : []);
    } catch { /* */ }
  }, [token]);

  const loadItems = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/report/get_items", {}, token);
      setItems(Array.isArray(res) ? res : []);
    } catch { /* */ }
  }, [token]);

  useEffect(() => { loadBranches(); loadItems(); }, [loadBranches, loadItems]);

  const loadReport = useCallback(async (p = 1) => {
    if (!token) return;
    setLoading(true);
    setPage(p);
    try {
      let endpoint = "";
      const body: any = { page: p };
      if (dateFrom) body.date_from = dateFrom;
      if (dateTo) body.date_to = dateTo;
      if (search) body.search = search;

      switch (reportType) {
        case "salesReport":
          endpoint = "/api/report/load_sales_report";
          if (branch) body.branch_id = branch;
          break;
        case "codeTransferReport":
          endpoint = "/api/report/code_transfer";
          break;
        case "topSellerReport":
          endpoint = "/api/report/top_seller_report";
          if (selectedItem) body.item = selectedItem;
          break;
        case "adjustWalletReport":
          endpoint = "/api/report/adjust_wallet";
          break;
        case "membersDetailReport":
          endpoint = "/api/report/members_detail";
          break;
      }

      const res = await apiPost<any>(endpoint, body, token);
      let rows: any[] = [];
      let lp = 1;
      if (res?.data) {
        rows = res.data;
        lp = res.last_page || 1;
      } else {
        rows = Array.isArray(res) ? res : [];
      }
      // Flatten top seller data (grouped by seller with nested receipts)
      if (reportType === "topSellerReport") {
        const flat: any[] = [];
        for (const seller of rows) {
          for (const receipt of (seller.receipts || [])) {
            flat.push({
              slot_no: seller.user_info?.slot_no || "",
              name: seller.user_info?.name || "",
              email: seller.user_info?.email || "",
              contact: seller.user_info?.contact || "",
              item_sku: receipt.item_sku || "",
              quantity: receipt.quantity || 0,
              price: receipt.price || "0",
              subtotal: receipt.subtotal || "0",
              total_sales: seller.total_sales || "0",
            });
          }
        }
        rows = flat;
      }
      setData(rows);
      setLastPage(lp);
    } catch (err: any) {
      console.error("Failed to load report:", err);
      setData([]);
    }
    setLoading(false);
  }, [token, reportType, dateFrom, dateTo, search, branch, selectedItem]);

  useEffect(() => { loadReport(1); }, [loadReport]);

  const handleExport = (format: string) => {
    let url = "";
    const params = new URLSearchParams();
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);
    if (search) params.append("search", search);

    switch (reportType) {
      case "salesReport":
        url = `/export/admin_sales_report/${format}`;
        if (branch) params.append("branch_id", branch);
        break;
      case "codeTransferReport":
        url = `/export/admin_code_transfer_report/xlxs`;
        break;
      case "topSellerReport":
        url = `/export/top_seller_report/xls`;
        if (selectedItem) params.append("item", selectedItem);
        break;
      case "adjustWalletReport":
        url = `/export/admin_adjustwallet_report/xlxs`;
        break;
      case "membersDetailReport":
        url = `/export/admin_members_detail_report/xlxs`;
        break;
    }

    if (url) {
      const fullUrl = `${API_BASE_URL}${url}?${params.toString()}`;
      window.open(fullUrl, "_blank");
    }
  };

  const viewReceipt = async (receiptId: number) => {
    try {
      const res = await apiPost<any>("/api/report/sales_receipt", { id: receiptId }, token);
      setReceiptData(res);
      setReceiptOpen(true);
    } catch {
      toast.error("Failed to load receipt");
    }
  };

  const loadQuoteRequests = async () => {
    try {
      const res = await apiPost<any>("/api/report/qoute_request", {}, token);
      setQuoteData(Array.isArray(res) ? res : (res?.data || []));
      setQuoteOpen(true);
    } catch {
      toast.error("Failed to load quote requests");
    }
  };

  const deleteQuoteRequest = async (id: number) => {
    if (!confirm("Delete this quote request?")) return;
    try {
      await apiPost("/api/report/delete_qoute_request", { id }, token);
      toast.success("Deleted");
      loadQuoteRequests();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const renderFilters = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Report Type</Label>
            <Select value={reportType} onValueChange={(v) => { setReportType(v); setData([]); }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((r) => (
                  <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {["codeTransferReport", "topSellerReport", "adjustWalletReport", "membersDetailReport"].includes(reportType) && (
            <div className="space-y-1">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-[200px]"
                />
              </div>
            </div>
          )}

          {reportType === "salesReport" && (
            <div className="space-y-1">
              <Label className="text-xs">Branch</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((b: any) => (
                    <SelectItem key={b.branch_id} value={String(b.branch_id)}>{b.branch_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {reportType === "topSellerReport" && (
            <div className="space-y-1">
              <Label className="text-xs">Item</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  {items.map((it: any) => (
                    <SelectItem key={it.item_id} value={String(it.item_id)}>{it.item_description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
          </div>

          <Button variant="outline" onClick={() => loadReport(1)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => handleExport("xls")}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          {reportType === "salesReport" && (
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          )}
          <Button variant="outline" onClick={loadQuoteRequests}>
            Quote Requests
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSalesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Receipt No</TableHead>
          <TableHead>Item Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Tax</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell>{row.receipt_id}</TableCell>
            <TableCell>{row.items?.[0]?.item_description || "—"}</TableCell>
            <TableCell>₱{row.items?.[0]?.price || "0"}</TableCell>
            <TableCell>{row.items?.[0]?.quantity || 0}</TableCell>
            <TableCell>{row.buyer_name || "—"}</TableCell>
            <TableCell>{row.receipt_date_created || row.order_date_created || "—"}</TableCell>
            <TableCell>₱{row.subtotal || "0"}</TableCell>
            <TableCell>{row.discount || "0"}%</TableCell>
            <TableCell>₱{row.tax_amount || "0"}</TableCell>
            <TableCell className="font-medium">₱{row.grand_total || "0"}</TableCell>
            <TableCell>
              <Badge variant="outline">{typeof row.payment_method === "object" ? row.payment_method?.cashier_payment_method_name : row.payment_method || "—"}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => viewReceipt(row.receipt_id)}>
                <Printer className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderCodeTransferTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Pin</TableHead>
          <TableHead>Origin Slot</TableHead>
          <TableHead>From Slot</TableHead>
          <TableHead>To Slot</TableHead>
          <TableHead>Transfer Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell className="font-mono">{row.code_activation || "—"}</TableCell>
            <TableCell className="font-mono">{row.code_pin || "—"}</TableCell>
            <TableCell>{row.original_slot_code?.slot_no || "—"}</TableCell>
            <TableCell>{row.from_slot_code?.slot_no || "—"}</TableCell>
            <TableCell>{row.to_slot_code?.slot_no || "—"}</TableCell>
            <TableCell>{row.date_transfer || "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderTopSellerTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Slot Code</TableHead>
          <TableHead>Full Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Item SKU</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Subtotal</TableHead>
          <TableHead>Total Sales</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell className="font-medium">{row.slot_no || "—"}</TableCell>
            <TableCell>{row.name || "—"}</TableCell>
            <TableCell>{row.email || "—"}</TableCell>
            <TableCell>{row.contact || "—"}</TableCell>
            <TableCell>{row.item_sku || "—"}</TableCell>
            <TableCell>{row.quantity || 0}</TableCell>
            <TableCell>₱{row.price || "0"}</TableCell>
            <TableCell>₱{row.subtotal || "0"}</TableCell>
            <TableCell className="font-medium">₱{row.total_sales || "0"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderAdjustWalletTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell>{row.name || "—"}</TableCell>
            <TableCell>{row.email || "—"}</TableCell>
            <TableCell className="font-medium">{row.slot_no || "—"}</TableCell>
            <TableCell>{row.adjusted_detail || "—"}</TableCell>
            <TableCell>₱{row.adjusted_amount || "0"}</TableCell>
            <TableCell>{row.date_created || "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderMembersDetailTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Sponsor</TableHead>
          <TableHead>Country</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell>{row.first_name || "—"}</TableCell>
            <TableCell>{row.last_name || "—"}</TableCell>
            <TableCell>{row.email || "—"}</TableCell>
            <TableCell>{row.contact || "—"}</TableCell>
            <TableCell className="font-medium">{row.name || "—"}</TableCell>
            <TableCell>{row.slot_sponsor_no?.[0]?.slot_sponsor_code || "—"}</TableCell>
            <TableCell>{row.country_name || "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderTable = () => {
    switch (reportType) {
      case "salesReport": return renderSalesTable();
      case "codeTransferReport": return renderCodeTransferTable();
      case "topSellerReport": return renderTopSellerTable();
      case "adjustWalletReport": return renderAdjustWalletTable();
      case "membersDetailReport": return renderMembersDetailTable();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and export system reports</p>
      </div>

      {renderFilters()}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No data found</div>
          ) : (
            renderTable()
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => loadReport(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {lastPage}
          </span>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => loadReport(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Sales Receipt Modal */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sales Receipt</DialogTitle>
          </DialogHeader>
          {receiptData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Receipt No:</span> <strong>{receiptData.receipt_id}</strong></div>
                <div><span className="text-muted-foreground">Date:</span> {receiptData.receipt_date_created}</div>
                <div><span className="text-muted-foreground">Customer:</span> {receiptData.buyer_name || "—"}</div>
                <div><span className="text-muted-foreground">Payment:</span> {typeof receiptData.payment_method === "object" ? receiptData.payment_method?.cashier_payment_method_name : receiptData.payment_method || "—"}</div>
              </div>
              <div className="border-t pt-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(receiptData.items) ? receiptData.items : [receiptData]).map((item: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{item.item_description || "—"}</TableCell>
                        <TableCell>₱{item.price || "0"}</TableCell>
                        <TableCell>{item.quantity || 1}</TableCell>
                        <TableCell>₱{item.subtotal || "0"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between border-t pt-3 font-medium">
                <span>Grand Total:</span>
                <span>₱{receiptData.grand_total || "0"}</span>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quote Requests Modal */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Requests</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quoteData.length > 0 ? quoteData.map((q: any, i: number) => (
                <TableRow key={q.qoute_request_id || i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{q.item_description || "—"}</TableCell>
                  <TableCell>{q.qoute_request_name || "—"}</TableCell>
                  <TableCell>{q.qoute_request_email || "—"}</TableCell>
                  <TableCell>{q.qoute_request_phone || "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{q.qoute_request_message || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => deleteQuoteRequest(q.qoute_request_id)}>
                      <span className="text-red-600">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No quote requests</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
