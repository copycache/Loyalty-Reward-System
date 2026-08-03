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
import { FileText, Download, Wallet } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

interface SlotData {
  slot_id: number;
  [key: string]: unknown;
}

interface WalletTabProps {
  slot: SlotData | null;
  active: boolean;
  onAdjust: () => void;
}

interface WalletFilters {
  from: string | null;
  to: string | null;
  id?: number;
}

const defaultFilters: WalletFilters = { from: null, to: null };

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

export function WalletTab({ slot, active, onAdjust }: WalletTabProps) {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState<WalletFilters>(defaultFilters);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [slot?.slot_id]);

  useEffect(() => {
    if (!active || !slot || !token) return;
    let cancelled = false;
    setData(null);
    apiPost<any>("/api/member/get_slot_wallet", { ...filters, id: slot.slot_id }, token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, [active, slot, token, filters]);

  return (
    <TabsContent value="wallet" className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Input type="date" className="w-[160px]" value={filters.from ?? ""} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || null }))} />
        <Input type="date" className="w-[160px]" value={filters.to ?? ""} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || null }))} />
        <div className="flex-1" />
        <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1" /> Export as PDF</Button>
        <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export as CSV</Button>
        <Button size="sm" onClick={onAdjust}><Wallet className="h-3 w-3 mr-1" /> Adjust Wallet</Button>
      </div>
      {!data ? <LoadingSpinner /> : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posting Date</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Debit / Credit</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Running Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.data ?? []).length > 0 ? (data.data ?? []).map((w: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{w.wallet_log_date_created ? formatDate(w.wallet_log_date_created) : "—"}</TableCell>
                  <TableCell>{w.wallet_log_details}</TableCell>
                  <TableCell>{w.wallet_log_type}</TableCell>
                  <TableCell className="text-right">{Number(w.wallet_log_amount ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{Number(w.wallet_log_running_balance ?? 0).toFixed(2)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No wallet transactions</TableCell></TableRow>
              )}
            </TableBody>
            {data.total_wallet != null && (
              <tfoot>
                <TableRow>
                  <TableHead colSpan={4} className="text-right">Current Balance</TableHead>
                  <TableHead className="text-right font-bold text-blue-600">{Number(data.total_wallet).toFixed(2)}</TableHead>
                </TableRow>
              </tfoot>
            )}
          </Table>
        </div>
      )}
    </TabsContent>
  );
}