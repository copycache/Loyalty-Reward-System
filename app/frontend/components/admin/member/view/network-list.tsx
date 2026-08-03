"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { FileText, Download } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

interface SlotData {
  slot_id: number;
  [key: string]: unknown;
}

interface NetworkTabProps {
  slot: SlotData | null;
  active: boolean;
}

interface NetworkFilters {
  level: string;
  type: string;
  search: string | null;
  id?: number;
}

const defaultFilters: NetworkFilters = { level: "all", type: "placement", search: null };

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

export function NetworkTab({ slot, active }: NetworkTabProps) {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState<NetworkFilters>(defaultFilters);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [slot?.slot_id]);

  useEffect(() => {
    if (!active || !slot || !token) return;
    let cancelled = false;
    setData(null);
    apiPost<any>("/api/member/get_slot_network", { ...filters, id: slot.slot_id }, token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, [active, slot, token, filters]);

  return (
    <TabsContent value="network" className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filters.level ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, level: v }))}>
          <SelectTrigger className="w-[80px]"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Array.from({ length: 11 }, (_, i) => i + 1).map((n) => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={filters.type ?? "placement"} onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent><SelectItem value="placement">Binary</SelectItem><SelectItem value="sponsor">Unilevel</SelectItem></SelectContent>
        </Select>
        <Input placeholder="Search Username or name" className="w-[200px]" value={filters.search ?? ""} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || null }))} />
        <div className="flex-1" />
        <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1" /> Export Item Breakdown</Button>
        <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1" /> Export as PDF</Button>
        <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export as CSV</Button>
      </div>
      {!data ? <LoadingSpinner /> : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Slot Owner</TableHead>
                <TableHead>Timestamp Created</TableHead>
                {filters.type === "placement" && <TableHead>Timestamp Placed</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.data ?? []).length > 0 ? (data.data ?? []).map((n: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{filters.type === "placement" ? n.placement_level : n.sponsor_level}</TableCell>
                  <TableCell><a href="javascript:void(0)" className="text-primary">{n.slot_no}</a></TableCell>
                  <TableCell><a href="javascript:void(0)" className="text-primary">{n.first_name} {n.last_name}</a></TableCell>
                  <TableCell>{formatDateTime(n.slot_date_created)}</TableCell>
                  {filters.type === "placement" && (
                    <TableCell>{n.slot_date_placed ? formatDateTime(n.slot_date_placed) : "Not placed yet"}</TableCell>
                  )}
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No network data</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </TabsContent>
  );
}