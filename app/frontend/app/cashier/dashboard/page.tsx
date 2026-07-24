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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  Loader2,
  Clock,
} from "lucide-react";

interface CashInRequest {
  id: number;
  member_name: string;
  amount: string | number;
  reference_number: string;
  created_at: string;
  status: string;
  [key: string]: unknown;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function CashierDashboardPage() {
  const { token } = useAuthStore();
  const [requests, setRequests] = useState<CashInRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selected, setSelected] = useState<CashInRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiPost<any>(
        "/api/cashier/pending/list",
        { page, search, per_page: 15 },
        token
      );
      if (res?.data) {
        setRequests(res.data);
        setTotalPages(res.last_page || 1);
      } else if (Array.isArray(res)) {
        setRequests(res);
        setTotalPages(1);
      } else {
        setRequests([]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load requests");
    }
    setLoading(false);
  }, [token, page, search]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    if (!token) return;
    setProcessing(id);
    try {
      await apiPost(
        `/api/cashier/pending/${action}`,
        { request_id: id },
        token
      );
      toast.success(
        `Cash-in request ${action === "approve" ? "approved" : "rejected"}`
      );
      setDetailOpen(false);
      loadRequests();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} request`);
    }
    setProcessing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cashier Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {useAuthStore.getState().user?.name || "Cashier"}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <form
              onSubmit={(e) => { e.preventDefault(); setPage(1); loadRequests(); }}
              className="flex gap-2 flex-1 min-w-[250px]"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by member, reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <Button variant="outline" onClick={() => { setPage(1); loadRequests(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No pending cash-in requests
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.member_name || "—"}</TableCell>
                    <TableCell className="font-medium">₱{r.amount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.reference_number || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.created_at || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[r.status] || statusColors.pending} gap-1`}>
                        <Clock className="h-3 w-3" />
                        {r.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction(r.id, "approve")}
                          disabled={processing === r.id}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          {processing === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction(r.id, "reject")}
                          disabled={processing === r.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelected(r); setDetailOpen(true); }}
                        >
                          View
                        </Button>
                      </div>
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
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cash-in Request Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Member</Label>
                  <p className="text-sm font-medium">{selected.member_name || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="text-sm font-bold">₱{selected.amount}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Reference #</Label>
                  <p className="text-sm">{selected.reference_number || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="text-sm">{selected.created_at || "—"}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction(selected.id, "approve")}
                  disabled={processing === selected.id}
                >
                  {processing === selected.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleAction(selected.id, "reject")}
                  disabled={processing === selected.id}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
