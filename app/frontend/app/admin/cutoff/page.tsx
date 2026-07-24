"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Play,
  FileText,
} from "lucide-react";

interface Cutoff {
  id: number;
  cutoff_id?: string;
  date_from: string;
  date_to: string;
  status: string;
  total_payout: string;
  processed_at?: string;
  member_count?: number;
}

interface CutoffResponse {
  data: Cutoff[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export default function AdminCutoffPage() {
  const { token } = useAuthStore();
  const [cutoffs, setCutoffs] = useState<Cutoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [running, setRunning] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultData, setResultData] = useState<Record<string, unknown> | null>(null);

  const loadCutoffs = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await apiPost<CutoffResponse>("/api/admin/cutoff/list", { page }, token);

      if (Array.isArray(res)) {
        setCutoffs(res);
        setTotalPages(1);
        setTotal(res.length);
      } else {
        setCutoffs(res.data || []);
        setTotalPages(res.last_page || 1);
        setTotal(res.total || 0);
      }
    } catch {
      toast.error("Failed to load cutoff periods");
    }

    setLoading(false);
  }, [token, page]);

  useEffect(() => {
    loadCutoffs();
  }, [loadCutoffs]);

  async function handleRunCutoff() {
    if (!token) return;
    setRunning(true);

    try {
      const res = await apiPost<Record<string, unknown>>("/api/admin/cutoff/run", {}, token);
      setResultData(res);
      setResultOpen(true);
      toast.success("Cutoff completed successfully");
      loadCutoffs();
    } catch {
      toast.error("Failed to run cutoff");
    }

    setRunning(false);
  }

  const statusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "done":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "running":
      case "processing":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6">Cutoff Management</h1>
          <p className="text-muted-foreground">{total} cutoff periods</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCutoffs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleRunCutoff} disabled={running}>
            <Play className="h-4 w-4 mr-2" />
            {running ? "Running..." : "Run Cutoff"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cutoff ID</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Payout</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : cutoffs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No cutoff periods found
                    </TableCell>
                  </TableRow>
                ) : (
                  cutoffs.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">
                        {c.cutoff_id || `#${c.id}`}
                      </TableCell>
                      <TableCell>
                        {new Date(c.date_from).toLocaleDateString()} — {new Date(c.date_to).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                      <TableCell className="font-medium">
                        ₱{parseFloat(c.total_payout || "0").toLocaleString()}
                      </TableCell>
                      <TableCell>{c.member_count ?? "—"}</TableCell>
                      <TableCell>
                        {c.processed_at ? new Date(c.processed_at).toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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

      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cutoff Results
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {resultData && Object.entries(resultData).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b pb-2">
                <span className="text-sm capitalize text-muted-foreground">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setResultOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
