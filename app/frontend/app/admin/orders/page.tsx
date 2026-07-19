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
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
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
  order_from: string;
  order_status: string;
  receipt: any;
  user_info: any;
  sponsor_info: any;
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

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const body: any = {
        page,
        search,
        per_page: 15,
      };
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
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders");
    }
    setLoading(false);
  }, [token, page, search, statusFilter, paymentFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const openDetail = async (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
    try {
      const detail = await apiPost<any>(
        "/api/orders/select_order",
        { order_id: order.order_id },
        token
      );
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
      toast.success(`Order status changed to ${newStatus}`);
      loadOrders();
      setDetailOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders ({total} total)
          </p>
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
                  placeholder="Search by order no., customer..."
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
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
                <SelectItem value="cod">COD</SelectItem>
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

            <Button variant="outline" onClick={() => { setPage(1); loadOrders(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
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
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.order_id}>
                    <TableCell className="font-medium">#{o.order_id}</TableCell>
                    <TableCell>{o.buyer_name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {o.order_date_created || "—"}
                    </TableCell>
                    <TableCell>{o.items?.length ?? "—"}</TableCell>
                    <TableCell className="font-medium">₱{o.grand_total}</TableCell>
                    <TableCell>{o.payment_method || "—"}</TableCell>
                    <TableCell>{o.order_from || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusColors[o.order_status] || statusColors.pending} hover:opacity-90 gap-1`}
                      >
                        {getStatusIcon(o.order_status)}
                        {(o.order_status || "pending").replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(o)}>
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

      {/* Order Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Details — #{selectedOrder?.order_id}
            </DialogTitle>
          </DialogHeader>

          {orderDetail ? (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <p className="text-sm font-medium">
                    {orderDetail.buyer_name || orderDetail.name || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>
                    <Badge
                      className={`${statusColors[orderDetail.order_status] || statusColors.pending}`}
                    >
                      {(orderDetail.order_status || "pending").replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Payment</Label>
                  <p className="text-sm">{typeof orderDetail.payment_method === 'object' ? orderDetail.payment_method?.payment_method_name : orderDetail.payment_method || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Source</Label>
                  <p className="text-sm">{orderDetail.order_from || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Total Amount</Label>
                  <p className="text-sm font-bold">₱{orderDetail.grand_total || "0.00"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="text-sm">
                    {orderDetail.order_date_created || "—"}
                  </p>
                </div>
              </div>

              {/* Items */}
              {orderDetail.items && (
                <>
                  <Label className="text-xs text-muted-foreground uppercase">Order Items</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(orderDetail.items) &&
                        orderDetail.items.map((item: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{item.item_name || item.product_name || item.name || "—"}</TableCell>
                            <TableCell>{item.quantity || item.qty || 0}</TableCell>
                            <TableCell>₱{item.item_price || item.price || "0.00"}</TableCell>
                            <TableCell>₱{item.subtotal || item.total || "0.00"}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {/* Shipping Info */}
              {orderDetail.shipping_info && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">
                    Shipping Information
                  </Label>
                  <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg">
                    {Object.entries(orderDetail.shipping_info).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <p className="text-sm">{String(value ?? "—")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="flex gap-2 border-t pt-4">
                <Label className="text-sm font-medium">Change Status:</Label>
                <div className="flex flex-wrap gap-2">
                  {["for_delivery", "delivery", "completed", "cancelled"].map(
                    (s) =>
                      s !== orderDetail.order_status && (
                        <Button
                          key={s}
                          size="sm"
                          variant={s === "cancelled" ? "destructive" : "outline"}
                          onClick={() => handleStatusChange(selectedOrder?.order_id, s)}
                        >
                          {s.replace(/_/g, " ")}
                        </Button>
                      )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
