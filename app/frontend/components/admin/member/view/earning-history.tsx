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

interface EarningsTabProps {
  slot: SlotData | null;
  active: boolean;
}

interface EarningFilters {
  type: string;
  from: string | null;
  to: string | null;
  search: string | null;
  id?: number;
}

const defaultFilters: EarningFilters = { type: "all", from: null, to: null, search: null };

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

function formatDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return d; }
}

export function EarningsTab({ slot, active }: EarningsTabProps) {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState<EarningFilters>(defaultFilters);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [slot?.slot_id]);

  useEffect(() => {
    if (!active || !slot || !token) return;
    let cancelled = false;
    setData(null);
    apiPost<any>("/api/member/get_slot_earnings", { ...filters, id: slot.slot_id }, token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, [active, slot, token, filters]);

  return (
    <TabsContent value="earnings" className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Select value={filters.type ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Type</SelectItem><SelectItem value="paid">Paid Slot</SelectItem></SelectContent>
        </Select>
        <Input type="date" className="w-[160px]" value={filters.from ?? ""} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || null }))} />
        <Input type="date" className="w-[160px]" value={filters.to ?? ""} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || null }))} />
        <Input placeholder="Search Username" className="w-[180px]" value={filters.search ?? ""} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || null }))} />
      </div>
      {!data ? <LoadingSpinner /> : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Earning Trigger</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.data ?? []).length > 0 ? (data.data ?? []).map((e: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{formatDate(e.earning_log_date_created)}</TableCell>
                  <TableCell>{e.earning_log_date_created ? new Date(e.earning_log_date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</TableCell>
                  <TableCell><a href="javascript:void(0)" className="text-primary">{e.earning_log_cause_name}</a></TableCell>
                  <TableCell>{e.earning_log_plan_type}</TableCell>
                  <TableCell className="text-right font-medium">{Number(e.earning_log_amount ?? 0).toFixed(2)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No earnings found</TableCell></TableRow>
              )}
            </TableBody>
            {data.total_earning != null && (
              <tfoot>
                <TableRow>
                  <TableHead colSpan={4} className="text-right">Total Earnings</TableHead>
                  <TableHead className="text-right font-bold text-blue-600">{Number(data.total_earning).toFixed(2)}</TableHead>
                </TableRow>
              </tfoot>
            )}
          </Table>
        </div>
      )}
    </TabsContent>
  );
}