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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  FileSpreadsheet,
  FileText,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  Hash,
  CreditCard,
  Gift,
  Save,
  Loader2,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Order {
  order_id: number;
  buyer_name: string;
  buyer_slot_code: string;
  buyer_slot_id: number;
  order_date_created: string;
  items: any[];
  grand_total: string | number;
  payment_method: string;
  payment_method_id?: string | number;
  order_from: string;
  order_status: string;
  delivery_method?: string;
  buyer_address?: string;
  buyer_contact_number?: string;
  buyer_email?: string;
  receiver_name?: string;
  receiver_contact?: string;
  receiver_email?: string;
  receipt?: any;
  receipt_info?: any;
  user_info?: any;
  sponsor_info?: any;
  [key: string]: any;
}

interface ChargeMethod {
  method_id: number;
  method_name: string;
  method_charge: string | number;
  method_discount: string | number;
  enable: number;
  [key: string]: any;
}

const statusTabs = [
  { value: "", label: "All" },
  { value: "for_delivery", label: "For Delivery" },
  { value: "delivery", label: "Delivery" },
  { value: "pick_up", label: "Pick Up" },
  { value: "completed", label: "Completed" },
  { value: "claimed", label: "Claimed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const statusColors: Record<string, string> = {
  for_delivery: "bg-blue-100 text-blue-800",
  delivery: "bg-purple-100 text-purple-800",
  pick_up: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  claimed: "bg-cyan-100 text-cyan-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const API_BASE_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
  : "http://localhost:8000";

export default function AdminOrdersPage() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Order detail modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState<any>(null);

  // Delivery charge
  const [chargeTable, setChargeTable] = useState<ChargeMethod[]>([]);
  const [chargeEdit, setChargeEdit] = useState<string | null>(null);
  const [editMethod, setEditMethod] = useState<ChargeMethod | null>(null);
  const [saving, setSaving] = useState(false);
  const [walletCurrency, setWalletCurrency] = useState("₱");

  // Order methods
  const [orderMethods, setOrderMethods] = useState<ChargeMethod[]>([]);

  // Dialog states
  const [deliveryChargeOpen, setDeliveryChargeOpen] = useState(false);
  const [orderMethodsOpen, setOrderMethodsOpen] = useState(false);
  const [claimCodeOpen, setClaimCodeOpen] = useState(false);
  const [claimCodeSearch, setClaimCodeSearch] = useState("");
  const [claimCodeResult, setClaimCodeResult] = useState<any[]>([]);
  const [selectedClaimCode, setSelectedClaimCode] = useState<any>(null);

  // Inline courier/tracking
  const [editingCourier, setEditingCourier] = useState<Record<number, string>>({});
  const [editingTracking, setEditingTracking] = useState<Record<number, string>>({});

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const body: any = { page, search, per_page: 15 };
      if (statusFilter) body.status = statusFilter;
      if (paymentFilter) body.payment = paymentFilter;
      if (dateFrom) body.from = dateFrom;
      if (dateTo) body.to = dateTo;

      const res = await apiPost<any>("/api/orders/get_orders", body, token);
      if (res?.data) {
        setOrders(res.data);
        setTotalPages(res.last_page || 1);
        setTotal(res.total || res.data.length);
      } else if (Array.isArray(res)) {
        setOrders(res);
        setTotalPages(1);
        setTotal(res.length);
      } else {
        setOrders([]);
      }
    } catch {
      toast.error("Failed to load orders");
    }
    setLoading(false);
  }, [token, page, search, statusFilter, paymentFilter, dateFrom, dateTo]);

  const loadChargeTable = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/orders/charge_table", {}, token);
      if (Array.isArray(res)) {
        setChargeTable(res);
        setOrderMethods(res);
      }
    } catch {
      // silent
    }
  }, [token]);

  const getDefaultWallet = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/orders/currency_default", {}, token);
      if (Array.isArray(res) && res[0]?.currency_abbreviation) {
        setWalletCurrency(res[0].currency_abbreviation);
      }
    } catch {
      // silent
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadChargeTable();
    getDefaultWallet();
  }, [loadChargeTable, getDefaultWallet]);

  const openDetail = async (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
    try {
      const detail = await apiPost<any>(
        "/api/orders/select_order",
        { order_id: order.order_id },
        token
      );
      if (detail?.discount && typeof detail.discount === "string") {
        detail.discount = JSON.parse(detail.discount);
      }
      setOrderDetail(detail);
    } catch {
      setOrderDetail(null);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!token) return;
    try {
      await apiPost(
        "/api/orders/change_status",
        { order_id: orderId, status: newStatus },
        token
      );
      toast.success(`Order status changed to ${newStatus.replace(/_/g, " ")}`);
      loadOrders();
      setDetailOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const updateOrderInfo = async (
    info: string,
    orderId: number,
    index: number
  ) => {
    if (!token) return;
    try {
      const body: any = { info, order_id: orderId };
      if (editingCourier[orderId] !== undefined) {
        body.courier = editingCourier[orderId];
      }
      if (editingTracking[orderId] !== undefined) {
        body.transaction_number = editingTracking[orderId];
      }
      await apiPost("/api/orders/updateOrderInfo", body, token);
      toast.success("Updated successfully");
      loadOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const saveDeliveryCharge = async () => {
    if (!token || !editMethod) return;
    setSaving(true);
    try {
      const res = await apiPost<any>(
        "/api/orders/edit_delivery_charge",
        editMethod,
        token
      );
      if (res?.status === "success") {
        toast.success(res.status_message || "Delivery charge updated");
        loadChargeTable();
      } else {
        toast.error(res?.status_message || "Failed to update");
      }
    } catch {
      toast.error("Failed to update delivery charge");
    }
    setSaving(false);
  };

  const saveOrdersMethod = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await apiPost<any>(
        "/api/orders/save_orders_method",
        orderMethods,
        token
      );
      if (res?.status === "success") {
        toast.success(res.status_message || "Order methods saved");
        loadChargeTable();
      } else {
        toast.error(res?.status_message || "Failed to save");
      }
    } catch {
      toast.error("Failed to save order methods");
    }
    setSaving(false);
  };

  const claimCodeSearchFn = async (query: string) => {
    if (!token) return;
    try {
      const res = await apiPost<any>(
        "/api/orders/claim_code_list",
        { claim_code_search: query },
        token
      );
      if (Array.isArray(res)) {
        setClaimCodeResult(res);
      }
    } catch {
      // silent
    }
  };

  const selectClaimCode = async (receiptId: number) => {
    if (!token) return;
    try {
      const res = await apiPost<any>(
        "/api/orders/select_claim_code",
        { receipt_id: receiptId },
        token
      );
      setSelectedClaimCode(res);
    } catch {
      toast.error("Failed to load claim code details");
    }
  };

  const claimCodeAction = async (
    receiptId: number,
    receiptCode: string,
    processorName: string,
    status: string
  ) => {
    if (!token) return;
    if (!processorName) {
      toast.error("Processor Name is required");
      return;
    }
    try {
      const res = await apiPost<any>(
        "/api/orders/update_claim_code",
        {
          receipt_id: receiptId,
          claim_code: receiptCode,
          processor_name: processorName,
          status,
        },
        token
      );
      if (res?.status === "success") {
        toast.success(res.status_message || "Claim code updated");
        selectClaimCode(receiptId);
      } else {
        toast.error(res?.status_message || "Failed to update");
      }
    } catch {
      toast.error("Failed to update claim code");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "claimed":
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
      case "refunded":
        return <XCircle className="h-3 w-3" />;
      case "delivery":
      case "for_delivery":
        return <Truck className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (paymentFilter) params.set("payment", paymentFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));
    return params.toString();
  };

  const exportUrl = (format: "xls" | "pdf") =>
    `${API_BASE_URL}/export/selected_orders/${format}?${buildQueryString()}`;

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders List</h1>
          <p className="text-muted-foreground">
            Manage member orders and its delivery ({total} total)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadChargeTable();
              setOrderMethodsOpen(true);
            }}
          >
            <Package className="h-4 w-4 mr-1" />
            Manage Orders Method
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadChargeTable();
              setDeliveryChargeOpen(true);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Delivery Charge
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setClaimCodeOpen(true)}
          >
            <Search className="h-4 w-4 mr-1" />
            Claim Code
          </Button>
          <a href={exportUrl("xls")} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Export Excel
            </Button>
          </a>
          <a href={exportUrl("pdf")} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Export PDF
            </Button>
          </a>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
      >
        <TabsList className="flex-wrap h-auto">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                loadOrders();
              }}
              className="flex gap-2 flex-1 min-w-[250px]"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <Select
              value={paymentFilter || "all"}
              onValueChange={(v) => setPaymentFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="4">Wallet</SelectItem>
                <SelectItem value="6">COD</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">From:</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">To:</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px]"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                loadOrders();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center whitespace-nowrap">Order No.</TableHead>
                <TableHead className="text-center whitespace-nowrap">Ordered Items</TableHead>
                <TableHead className="text-center whitespace-nowrap">Qty</TableHead>
                <TableHead className="text-center whitespace-nowrap">Username</TableHead>
                <TableHead className="text-center whitespace-nowrap">Member Name</TableHead>
                <TableHead className="text-center whitespace-nowrap">Receiver&apos;s Name</TableHead>
                <TableHead className="text-center whitespace-nowrap">Contact</TableHead>
                <TableHead className="text-center whitespace-nowrap">Email</TableHead>
                <TableHead className="text-center whitespace-nowrap">Sponsor Username</TableHead>
                <TableHead className="text-center whitespace-nowrap">Sponsor Name</TableHead>
                <TableHead className="text-center whitespace-nowrap">Date Ordered</TableHead>
                {statusFilter === "delivery" && (
                  <TableHead className="text-center whitespace-nowrap">Date Shipped</TableHead>
                )}
                <TableHead className="text-center whitespace-nowrap">Total</TableHead>
                {statusFilter === "" && (
                  <TableHead className="text-center whitespace-nowrap">Order Status</TableHead>
                )}
                <TableHead className="text-center whitespace-nowrap">Order Type</TableHead>
                <TableHead className="text-center whitespace-nowrap">Payment Method</TableHead>
                {statusFilter !== "pick_up" && (
                  <TableHead className="text-center whitespace-nowrap" style={{ minWidth: 165 }}>
                    Address
                  </TableHead>
                )}
                {statusFilter === "pick_up" && (
                  <TableHead className="text-center whitespace-nowrap">Picked Up</TableHead>
                )}
                <TableHead className="text-center whitespace-nowrap">Claim Code</TableHead>
                {statusFilter !== "pick_up" && statusFilter !== "" && (
                  <>
                    <TableHead className="text-center whitespace-nowrap">Courier</TableHead>
                    <TableHead className="text-center whitespace-nowrap">Tracking Number</TableHead>
                  </>
                )}
                <TableHead className="text-center whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={22}
                    className="text-center py-10"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={22}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o, i) => (
                  <TableRow key={o.order_id}>
                    <TableCell
                      className="text-center font-medium cursor-pointer"
                      onClick={() => openDetail(o)}
                    >
                      #{o.order_id}
                    </TableCell>
                    <TableCell
                      className="text-center cursor-pointer"
                      onClick={() => openDetail(o)}
                    >
                      {o.items?.length
                        ? o.items.map((it: any, idx: number) => (
                            <div key={idx}>{it.item_sku || it.sku || "—"}</div>
                          ))
                        : "—"}
                    </TableCell>
                    <TableCell
                      className="text-center cursor-pointer"
                      onClick={() => openDetail(o)}
                    >
                      {o.items?.length
                        ? o.items.map((it: any, idx: number) => (
                            <div key={idx}>{it.quantity || 0}</div>
                          ))
                        : "—"}
                    </TableCell>
                    <TableCell
                      className="text-center cursor-pointer"
                      onClick={() => openDetail(o)}
                    >
                      {o.buyer_slot_code || "—"}
                    </TableCell>
                    <TableCell
                      className="text-center cursor-pointer"
                      onClick={() => openDetail(o)}
                    >
                      {o.buyer_name || "—"}
                    </TableCell>
                    <TableCell
                      className="text-center cursor-pointer"
                      onClick={() => openDetail(o)}
                    >
                      {o.receiver_name || o.buyer_name || "—"}
                    </TableCell>
                    <TableCell
                      className="text-center cursor-pointer"
                      onClick={() => openDetail(o)}
                    >
                      {o.receiver_contact ||
                        o.user_info?.contact ||
                        o.buyer_contact_number ||
                        "N/A"}
                    </TableCell>
                    <TableCell
                      className="text-center cursor-pointer"
                      onClick={() => openDetail(o)}
                    >
                      {o.receiver_email ||
                        o.user_info?.email ||
                        o.buyer_email ||
                        "N/A"}
                    </TableCell>
                    <TableCell
                      className="text-center cursor-pointer"
                      onClick={() => openDetail(o)}
                    >
                      {o.sponsor_info?.slot_no || "N/A"}
                    </TableCell>
                    <TableCell
                      className="text-center cursor-pointer"
                      onClick={() => openDetail(o)}
                    >
                      {o.sponsor_info?.name || "N/A"}
                    </TableCell>
                    <TableCell
                      className="text-center cursor-pointer text-sm text-muted-foreground"
                      onClick={() => openDetail(o)}
                    >
                      {o.order_date_created || "—"}
                    </TableCell>
                    {statusFilter === "delivery" && (
                      <TableCell className="text-center">none</TableCell>
                    )}
                    <TableCell className="text-center font-medium">
                      {walletCurrency}
                      {o.grand_total}
                    </TableCell>
                    {statusFilter === "" && (
                      <TableCell className="text-center">
                        <Badge
                          className={`${statusColors[o.order_status] || statusColors.pending} hover:opacity-90 gap-1`}
                        >
                          {getStatusIcon(o.order_status)}
                          {(o.order_status || "pending").replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      {o.delivery_method === "none"
                        ? "Cashier"
                        : o.delivery_method || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {o.payment_method || "—"}
                    </TableCell>
                    {statusFilter !== "pick_up" && (
                      <TableCell className="text-center">
                        {o.buyer_address || "—"}
                      </TableCell>
                    )}
                    {statusFilter === "pick_up" && (
                      <TableCell className="text-center">
                        {o.receipt?.claimed == 1 ? "Claimed" : "Unclaimed"}
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      {o.receipt?.claim_code || o.receipt_info?.claim_code || "—"}
                    </TableCell>
                    {statusFilter !== "pick_up" && statusFilter !== "" && (
                      <>
                        <TableCell className="text-center">
                          {o.order_status === "pending" ||
                          o.order_status === "for_delivery" ? (
                            <div className="flex items-center gap-1">
                              <Input
                                className="h-8 w-24 text-xs"
                                defaultValue={o.receipt?.courier || ""}
                                onChange={(e) =>
                                  setEditingCourier((prev) => ({
                                    ...prev,
                                    [o.order_id]: e.target.value,
                                  }))
                                }
                              />
                              <button
                                className="text-blue-600 underline text-xs whitespace-nowrap"
                                onClick={() =>
                                  updateOrderInfo("courier", o.order_id, i)
                                }
                              >
                                Update
                              </button>
                            </div>
                          ) : (
                            o.receipt?.courier || "—"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {o.order_status === "pending" ||
                          o.order_status === "for_delivery" ? (
                            <div className="flex items-center gap-1">
                              <Input
                                className="h-8 w-24 text-xs"
                                defaultValue={
                                  o.receipt?.transaction_number || ""
                                }
                                onChange={(e) =>
                                  setEditingTracking((prev) => ({
                                    ...prev,
                                    [o.order_id]: e.target.value,
                                  }))
                                }
                              />
                              <button
                                className="text-blue-600 underline text-xs whitespace-nowrap"
                                onClick={() =>
                                  updateOrderInfo(
                                    "transaction_number",
                                    o.order_id,
                                    i
                                  )
                                }
                              >
                                Update
                              </button>
                            </div>
                          ) : (
                            o.receipt?.transaction_number || "—"
                          )}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(o)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Details — #{selectedOrder?.order_id}
            </DialogTitle>
          </DialogHeader>

          {orderDetail ? (
            <div className="space-y-6">
              {/* Items Table */}
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Order ID</TableHead>
                      <TableHead className="text-center">Product SKU</TableHead>
                      <TableHead className="text-center">Product Description</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-center">Discount</TableHead>
                      <TableHead className="text-center">Price</TableHead>
                      <TableHead className="text-center">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(orderDetail.item || orderDetail.items)
                      ? (orderDetail.item || orderDetail.items).map(
                          (details: any, idx: number) => {
                            const discount =
                              orderDetail.discount?.[idx]?.percentage || 0;
                            const discountedPrice =
                              Number(details.item_price) - Number(discount);
                            return (
                              <TableRow key={idx}>
                                <TableCell className="text-center">
                                  {details.order_id || selectedOrder?.order_id}
                                </TableCell>
                                <TableCell className="text-center">
                                  {details.item_sku || "—"}
                                </TableCell>
                                <TableCell className="text-center max-w-[250px]">
                                  <div
                                    className="text-xs line-clamp-3"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        details.item_description ||
                                        details.product_name ||
                                        details.name ||
                                        "—",
                                    }}
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  {details.quantity || 0}
                                </TableCell>
                                <TableCell className="text-center">
                                  {discount
                                    ? `${walletCurrency}${Number(discount).toFixed(2)}`
                                    : "No Discount"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {discount ? (
                                    <>
                                      <span className="line-through text-muted-foreground mr-1">
                                        {walletCurrency}
                                        {Number(details.item_price).toFixed(2)}
                                      </span>
                                      <span>
                                        {walletCurrency}
                                        {discountedPrice.toFixed(2)}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      {walletCurrency}
                                      {Number(details.item_price).toFixed(2)}
                                    </>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {walletCurrency}
                                  {(
                                    discountedPrice * Number(details.quantity)
                                  ).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          }
                        )
                      : null}
                    {orderDetail.delivery_charge && (
                      <TableRow>
                        <TableCell
                          className="text-right font-medium"
                          colSpan={6}
                        >
                          Delivery Charge
                        </TableCell>
                        <TableCell className="text-center">
                          {walletCurrency}
                          {Number(orderDetail.delivery_charge).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <tfoot>
                    <TableRow>
                      <TableCell
                        className="text-right font-bold"
                        colSpan={6}
                      >
                        TOTAL
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {walletCurrency}
                        {Number(
                          orderDetail.grand_total ||
                            selectedOrder?.grand_total ||
                            0
                        ).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </tfoot>
                </Table>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                <span className="text-sm font-medium mr-2">Change Status:</span>
                {statusFilter === "delivery" || statusFilter === "pick_up" ? (
                  <>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleStatusChange(selectedOrder?.order_id, "cancelled")
                      }
                    >
                      Set as Cancelled
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() =>
                        handleStatusChange(selectedOrder?.order_id, "completed")
                      }
                    >
                      Set as Completed
                    </Button>
                  </>
                ) : statusFilter === "for_delivery" || statusFilter === "" || statusFilter === "pending" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleStatusChange(selectedOrder?.order_id, "delivery")
                      }
                    >
                      Set as Delivery
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleStatusChange(selectedOrder?.order_id, "cancelled")
                      }
                    >
                      Set as Cancelled
                    </Button>
                  </>
                ) : null}
                {statusFilter === "cancelled" &&
                  selectedOrder?.payment_method !== "COD" &&
                  selectedOrder?.payment_method !== "COP" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleStatusChange(selectedOrder?.order_id, "refunded")
                      }
                    >
                      Refund Amount
                    </Button>
                  )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delivery Charge Dialog */}
      <Dialog
        open={deliveryChargeOpen}
        onOpenChange={(v) => {
          setDeliveryChargeOpen(v);
          if (!v) {
            setChargeEdit(null);
            setEditMethod(null);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Delivery Charge
            </DialogTitle>
          </DialogHeader>

          {/* Charge table */}
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center" style={{ width: "30%" }}>
                    Method Name
                  </TableHead>
                  <TableHead className="text-center" style={{ width: "30%" }}>
                    Charge
                  </TableHead>
                  <TableHead className="text-center" style={{ width: "40%" }}>
                    Discount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chargeTable.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  chargeTable.map((charge) => (
                    <TableRow
                      key={charge.method_id}
                      className="cursor-pointer"
                      onClick={() => {
                        setChargeEdit("edit");
                        setEditMethod(charge);
                      }}
                    >
                      <TableCell className="text-center">
                        {charge.method_name === "Direct"
                          ? "Over the counter"
                          : charge.method_name === "Indirect"
                            ? "Delivery"
                            : charge.method_name === "Dropshipping"
                              ? "Dropshipping"
                              : charge.method_name}
                      </TableCell>
                      <TableCell className="text-center">
                        {walletCurrency}
                        {charge.method_charge}
                      </TableCell>
                      <TableCell className="text-center">
                        {walletCurrency}
                        {charge.method_discount}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Edit mode */}
          {chargeEdit === "edit" && editMethod && (
            <div className="space-y-4 border-t pt-4 mt-4">
              <div className="text-sm font-semibold">
                Update Delivery Charge
              </div>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center" colSpan={2}>
                        {editMethod.method_name === "Direct"
                          ? "Over the counter"
                          : editMethod.method_name === "Indirect"
                            ? "Delivery"
                            : editMethod.method_name === "Dropshipping"
                              ? "Dropshipping"
                              : editMethod.method_name}
                      </TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead className="text-center">Charge</TableHead>
                      <TableHead className="text-center">Discount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          className="text-center"
                          value={editMethod.method_charge}
                          onChange={(e) =>
                            setEditMethod((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    method_charge: e.target.value,
                                  }
                                : prev
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          className="text-center"
                          value={editMethod.method_discount}
                          onChange={(e) =>
                            setEditMethod((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    method_discount: e.target.value,
                                  }
                                : prev
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <Button
                className="w-full"
                disabled={saving}
                onClick={saveDeliveryCharge}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save & Update Method
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Methods Dialog */}
      <Dialog
        open={orderMethodsOpen}
        onOpenChange={(v) => {
          setOrderMethodsOpen(v);
          if (!v) loadChargeTable();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders Methods
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center" style={{ width: "70%" }}>
                    Method Name
                  </TableHead>
                  <TableHead className="text-center" style={{ width: "30%" }}>
                    Enable/Disable
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderMethods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orderMethods.map((m, idx) => (
                    <TableRow key={m.method_id}>
                      <TableCell className="text-center">
                        {m.method_name === "Direct"
                          ? "Over the counter"
                          : m.method_name === "Indirect"
                            ? "Delivery"
                            : m.method_name === "Dropshipping"
                              ? "Dropshipping"
                              : m.method_name}
                      </TableCell>
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={m.enable === 1}
                          onChange={() => {
                            const updated = [...orderMethods];
                            updated[idx] = {
                              ...updated[idx],
                              enable: m.enable === 1 ? 0 : 1,
                            };
                            setOrderMethods(updated);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Button
            className="w-full"
            disabled={saving}
            onClick={saveOrdersMethod}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save & Update Method
          </Button>
        </DialogContent>
      </Dialog>

      {/* Claim Code Lookup Dialog */}
      <Dialog open={claimCodeOpen} onOpenChange={setClaimCodeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Item Claiming Module
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Enter item name or scan barcode..."
                value={claimCodeSearch}
                onChange={(e) => {
                  setClaimCodeSearch(e.target.value);
                  claimCodeSearchFn(e.target.value);
                }}
              />
              {claimCodeResult.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[294px] overflow-auto">
                  {claimCodeResult.map((r: any) => (
                    <div
                      key={r.receipt_id}
                      className="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                      onClick={() => {
                        selectClaimCode(r.receipt_id);
                        setClaimCodeSearch("");
                        setClaimCodeResult([]);
                      }}
                    >
                      <b className="mr-2">{r.claim_code}</b>
                      <i>({r.buyer_name})</i> —{" "}
                      <span
                        className={
                          r.claimed == 1 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {r.claimed == 1 ? "claimed" : "Unclaim"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedClaimCode && (
              <div className="space-y-4 border rounded-lg p-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Receipt Code</TableCell>
                      <TableCell className="text-center">
                        {selectedClaimCode.claim_code}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Status</TableCell>
                      <TableCell
                        className={`text-center ${selectedClaimCode.claimed == 1 ? "text-green-600" : "text-red-600"}`}
                      >
                        {selectedClaimCode.claimed == 1
                          ? "Claimed"
                          : "Unclaimed"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div>
                  <div className="text-sm font-medium mb-2">Items</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Item</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClaimCode.items?.map(
                        (item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="text-center">
                              {item.item_sku}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.quantity}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">
                    Customer Information
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Name:</div>
                    <div>{selectedClaimCode.buyer_name}</div>
                    <div>Username:</div>
                    <div>{selectedClaimCode.buyer_slot_code}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">
                    Processor Information
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm items-center">
                    <div>Processor Name:</div>
                    <div>
                      <Input
                        value={selectedClaimCode.processor_name || ""}
                        onChange={(e) =>
                          setSelectedClaimCode((prev: any) =>
                            prev
                              ? { ...prev, processor_name: e.target.value }
                              : prev
                          )
                        }
                        disabled={selectedClaimCode.claimed === 1}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedClaimCode.claimed == 0 ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        claimCodeAction(
                          selectedClaimCode.receipt_id,
                          selectedClaimCode.claim_code,
                          selectedClaimCode.processor_name,
                          "claim"
                        )
                      }
                    >
                      Set as Claimed
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() =>
                        claimCodeAction(
                          selectedClaimCode.receipt_id,
                          selectedClaimCode.claim_code,
                          selectedClaimCode.processor_name,
                          "unclaim"
                        )
                      }
                    >
                      Set as Unclaimed
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedClaimCode(null)}
                  >
                    Detach Claim Code
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClaimCodeOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
