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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import {
  BarChart3,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

interface SummaryCard {
  label: string;
  value: string;
  icon?: string;
}

interface ReportData {
  summary?: SummaryCard[];
  columns?: string[];
  rows?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
  [key: string]: unknown;
}

const REPORT_LABELS: Record<string, string> = {
  sales: "Sales Report",
  members: "Members Report",
  commissions: "Commissions Report",
  payouts: "Payouts Report",
  bonuses: "Bonuses Report",
  transactions: "Transactions Report",
};

const REPORT_ICONS: Record<string, React.ReactNode> = {
  sales: <DollarSign className="h-5 w-5" />,
  members: <Users className="h-5 w-5" />,
  commissions: <TrendingUp className="h-5 w-5" />,
};

const PAGE_SIZE = 15;

export default function AdminReportPage() {
  const { token } = useAuthStore();
  const params = useParams();
  const filter = params.filter as string;

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const reportLabel = REPORT_LABELS[filter] || `${filter.charAt(0).toUpperCase() + filter.slice(1)} Report`;

  const loadReport = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const body: Record<string, string> = {};
      if (dateFrom) body.date_from = dateFrom;
      if (dateTo) body.date_to = dateTo;
      body.page = String(page);

      const res = await apiPost<ReportData>(`/api/admin/report/${filter}`, body, token);
      setReportData(res);
    } catch {
      toast.error(`Failed to load ${reportLabel}`);
    }

    setLoading(false);
  }, [token, filter, dateFrom, dateTo, page, reportLabel]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo]);

  function handleExport() {
    toast.success("Export started");
  }

  const summary = Array.isArray(reportData?.summary) ? reportData.summary : [];
  const columns = Array.isArray(reportData?.columns) ? reportData.columns : [];
  const rows = reportData?.rows || reportData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {REPORT_ICONS[filter] || <BarChart3 className="h-6 w-6 text-blue-600" />}
          <div>
            <h1 className="text-2xl font-bold mb-6">{reportLabel}</h1>
            <p className="text-muted-foreground">
              {dateFrom || dateTo
                ? `${dateFrom || "Start"} — ${dateTo || "End"}`
                : "All time"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadReport}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Date From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[180px]"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setDateFrom(""); setDateTo(""); }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {summary.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {summary.map((s, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {s.label}
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{s.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {(rows.length > 0 || columns.length > 0) && (
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.length > 0 ? columns.map((col, i) => (
                          <TableHead key={i}>
                            {col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </TableHead>
                        )) : (
                          Object.keys(rows[0] || {}).map((col, i) => (
                            <TableHead key={i}>
                              {col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </TableHead>
                          ))
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={Math.max(columns.length, 1)}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No data found
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((row, rowIdx) => (
                          <TableRow key={rowIdx}>
                            {columns.length > 0
                              ? columns.map((col, colIdx) => (
                                  <TableCell key={colIdx}>
                                    {String(row[col] ?? "—")}
                                  </TableCell>
                                ))
                              : Object.values(row).map((val, colIdx) => (
                                  <TableCell key={colIdx}>
                                    {String(val ?? "—")}
                                  </TableCell>
                                ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {rows.length >= PAGE_SIZE && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {rows.length} entries
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
                        onClick={() => setPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!reportData && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Unable to load report data
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
