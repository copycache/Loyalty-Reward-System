"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function MemberOrderPage() {
  const { token, currentSlot } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async (pg: number) => {
    setLoading(true);
    try {
      const res = await apiPost("/api/member/get_orders", { slot_id: currentSlot?.slot_id, page: pg }, token);
      if (res?.data) {
        setOrders(res.data.data || res.data);
        setTotalPages(res.data.last_page || 1);
      }
    } catch {
      console.error("Failed to load orders");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchOrders(page);
  }, [token, page]);

  const formatCurrency = (val: any) => {
    return `₱${(parseFloat(val) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  };

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "default";
      case "pending":
      case "processing":
        return "secondary";
      case "cancelled":
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold">{order.order_no || order.id}</TableCell>
                      <TableCell className="text-sm">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>{order.items_count || order.items?.length || "-"}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColor(order.status) as any}>
                          {order.status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Order #{order.order_no || order.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Date</p>
                                  <p>
                                    {order.created_at
                                      ? new Date(order.created_at).toLocaleDateString()
                                      : "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Status</p>
                                  <Badge variant={statusColor(order.status) as any}>
                                    {order.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Payment</p>
                                  <p>{order.payment_method || order.wallet_type || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Total</p>
                                  <p className="font-bold">{formatCurrency(order.total)}</p>
                                </div>
                              </div>

                              {order.items && order.items.length > 0 && (
                                <div>
                                  <p className="font-semibold mb-2">Items</p>
                                  <div className="space-y-2">
                                    {order.items.map((item: any, i: number) => (
                                      <div
                                        key={i}
                                        className="flex justify-between text-sm border-b pb-2"
                                      >
                                        <div>
                                          <p>{item.product_name || item.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            Qty: {item.quantity}
                                          </p>
                                        </div>
                                        <p className="font-semibold">
                                          {formatCurrency(item.total || item.price * item.quantity)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {order.shipping_address && (
                                <div>
                                  <p className="font-semibold mb-1">Shipping Address</p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.shipping_address}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
