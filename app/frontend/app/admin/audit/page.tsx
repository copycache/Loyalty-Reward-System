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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  FileText,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AuditEntry {
  audit_trail_id: number;
  user_id: number;
  action: string;
  old_value: string | null;
  new_value: string | null;
  date_created: string;
  name?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

const actionColors: Record<string, string> = {
  Login: "bg-blue-100 text-blue-800",
  "Adjust Wallet": "bg-green-100 text-green-800",
  "Update Sign Up Bonus": "bg-purple-100 text-purple-800",
  "Update Personal Cashback": "bg-yellow-100 text-yellow-800",
  "Package Submit": "bg-orange-100 text-orange-800",
  "Edit Lockdown Complan": "bg-red-100 text-red-800",
};

export default function AdminAuditTrailPage() {
  const { token } = useAuthStore();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState<string[]>([]);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<AuditEntry | null>(null);

  const loadEntries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const body: any = { page };
      if (search) body.search = search;
      if (actionFilter) body.action_filter = actionFilter;
      if (dateFrom) body.date_from = dateFrom;
      if (dateTo) body.date_to = dateTo;

      const res = await apiPost<any>("/api/audit_trail/get", body, token);
      if (res?.data) {
        setEntries(res.data);
        setTotalPages(res.last_page || 1);
        setTotal(res.total || 0);
      } else if (Array.isArray(res)) {
        setEntries(res);
        setTotalPages(1);
        setTotal(res.length);
      } else {
        setEntries([]);
      }
    } catch (err: any) {
      console.error("Failed to load audit trail:", err);
      setEntries([]);
    }
    setLoading(false);
  }, [token, page, search, actionFilter, dateFrom, dateTo]);

  const loadActions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/audit_trail/get_actions", {}, token);
      setActions(Array.isArray(res) ? res : []);
    } catch { /* optional */ }
  }, [token]);

  useEffect(() => { loadEntries(); }, [loadEntries]);
  useEffect(() => { loadActions(); }, [loadActions]);

  const formatValue = (val: string | null) => {
    if (!val) return "—";
    try {
      // Try to unserialize PHP serialized data for display
      // Just show raw for now, truncated
      const decoded = val.replace(/^s:\d+:"|";$/g, "");
      return decoded.length > 200 ? decoded.substring(0, 200) + "..." : decoded;
    } catch {
      return val.length > 200 ? val.substring(0, 200) + "..." : val;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-muted-foreground">
          Track all administrative actions and changes ({total} entries)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <form
              onSubmit={(e) => { e.preventDefault(); setPage(1); loadEntries(); }}
              className="flex gap-2 flex-1 min-w-[250px]"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by action or user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <Select value={actionFilter || "all"} onValueChange={(v) => { setActionFilter(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">From:</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">To:</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
            </div>

            <Button variant="outline" onClick={() => { setPage(1); loadEntries(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No audit trail entries found
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((e) => (
                  <TableRow key={e.audit_trail_id}>
                    <TableCell className="text-muted-foreground">{e.audit_trail_id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {e.name || `${e.first_name || ""} ${e.last_name || ""}`.trim() || "System"}
                        </p>
                        <p className="text-xs text-muted-foreground">{e.email || "—"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${actionColors[e.action] || "bg-gray-100 text-gray-800"} hover:opacity-90`}>
                        {e.action || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {e.date_created ? new Date(e.date_created).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setDetailEntry(e); setDetailOpen(true); }}
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

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Trail Entry #{detailEntry?.audit_trail_id}
            </DialogTitle>
          </DialogHeader>
          {detailEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p className="text-sm font-medium">
                    {detailEntry.name || `${detailEntry.first_name || ""} ${detailEntry.last_name || ""}`.trim() || "System"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{detailEntry.email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Action</Label>
                  <Badge className={`${actionColors[detailEntry.action] || "bg-gray-100 text-gray-800"}`}>
                    {detailEntry.action}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="text-sm">{detailEntry.date_created ? new Date(detailEntry.date_created).toLocaleString() : "—"}</p>
                </div>
              </div>

              {detailEntry.old_value && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Old Value</Label>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all max-h-48">
                    {formatValue(detailEntry.old_value)}
                  </pre>
                </div>
              )}

              {detailEntry.new_value && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">New Value</Label>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all max-h-48">
                    {formatValue(detailEntry.new_value)}
                  </pre>
                </div>
              )}

              {!detailEntry.old_value && !detailEntry.new_value && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No detailed change data recorded for this action.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
