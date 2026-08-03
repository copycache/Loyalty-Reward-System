"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

interface SlotData {
  slot_id: number;
  [key: string]: unknown;
}

interface PayoutTabProps {
  slot: SlotData | null;
  active: boolean;
}

interface PayoutFilters {
  from: string | null;
  to: string | null;
  id?: number;
}

const defaultFilters: PayoutFilters = { from: null, to: null };

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

export function PayoutTab({ slot, active }: PayoutTabProps) {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState<PayoutFilters>(defaultFilters);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [slot?.slot_id]);

  useEffect(() => {
    if (!active || !slot || !token) return;
    let cancelled = false;
    setData(null);
    apiPost<any>("/api/member/get_slot_payout", { ...filters, id: slot.slot_id }, token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, [active, slot, token, filters]);

  return (
    <TabsContent value="payout" className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Input type="date" className="w-[160px]" value={filters.from ?? ""} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || null }))} />
        <Input type="date" className="w-[160px]" value={filters.to ?? ""} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || null }))} />
        <div className="flex-1" />
        <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1" /> Export as PDF</Button>
        <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export as CSV</Button>
      </div>
      {!data ? <LoadingSpinner /> : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp Requested</TableHead>
                <TableHead>Timestamp Processed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Deposit Amount</TableHead>
                <TableHead className="text-right">Additional Charge</TableHead>
                <TableHead className="text-right">Total Wallet Deduction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.data ?? []).length > 0 ? (data.data ?? []).map((p: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{formatDateTime(p.wallet_log_date_created)}</TableCell>
                  <TableCell>{formatDateTime(p.wallet_log_date_created)}</TableCell>
                  <TableCell>{p.wallet_log_details}</TableCell>
                  <TableCell className="text-right">{Number(p.wallet_log_amount ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{Number(p.wallet_log_amount ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{Number(p.wallet_log_amount ?? 0).toFixed(2)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No payout history</TableCell></TableRow>
              )}
            </TableBody>
            {data.total_payout != null && (
              <tfoot>
                <TableRow>
                  <TableHead colSpan={5} className="text-right">Total Deposit</TableHead>
                  <TableHead className="text-right font-bold text-red-600">{Number(data.total_payout).toFixed(2)}</TableHead>
                </TableRow>
              </tfoot>
            )}
          </Table>
        </div>
      )}
    </TabsContent>
  );
}