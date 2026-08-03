"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

interface SlotData {
  slot_id: number;
  [key: string]: unknown;
}

interface PointsTabProps {
  slot: SlotData | null;
  active: boolean;
}

interface PointsFilters {
  type: string;
  from: string | null;
  to: string | null;
  id?: number;
}

const defaultFilters: PointsFilters = { type: "all", from: null, to: null };

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

function formatDateTime(d?: string) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return `${dt.toLocaleDateString()} (${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  } catch { return d; }
}

export function PointsTab({ slot, active }: PointsTabProps) {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState<PointsFilters>(defaultFilters);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [slot?.slot_id]);

  useEffect(() => {
    if (!active || !slot || !token) return;
    let cancelled = false;
    setData(null);
    apiPost<any>("/api/member/get_slot_points", { ...filters, id: slot.slot_id }, token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, [active, slot, token, filters]);

  return (
    <TabsContent value="points" className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Select value={filters.type ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Point Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Point Type</SelectItem>
            <SelectItem value="UNILEVEL_PPV">UNILEVEL PPV</SelectItem>
            <SelectItem value="UNILEVEL_GPV">UNILEVEL GPV</SelectItem>
            <SelectItem value="OVERRIDE_POINTS">OVERRIDE POINTS</SelectItem>
            <SelectItem value="BINARY_LEFT">BINARY LEFT</SelectItem>
            <SelectItem value="BINARY_RIGHT">BINARY RIGHT</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-[160px]" value={filters.from ?? ""} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || null }))} />
        <Input type="date" className="w-[160px]" value={filters.to ?? ""} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || null }))} />
      </div>
      {!data ? <LoadingSpinner /> : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posting Timestamp</TableHead>
                <TableHead>Trigger / Detail</TableHead>
                <TableHead>Point Type</TableHead>
                <TableHead>Slot Trigger</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Debit / Credit</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Running Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.data ?? []).length > 0 ? (data.data ?? []).map((p: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{formatDateTime(p.points_log_date_created)}</TableCell>
                  <TableCell>Product Purchase</TableCell>
                  <TableCell>{p.points_log_type}</TableCell>
                  <TableCell>{p.slot_trigger?.slot_no ?? "—"}</TableCell>
                  <TableCell>000000034</TableCell>
                  <TableCell>{Number(p.points_log_amount) < 0 ? "CREDIT" : "DEBIT"}</TableCell>
                  <TableCell className="text-right">{Number(p.points_log_amount ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{Number(p.running_balance ?? 0).toFixed(2)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No points history</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </TabsContent>
  );
}