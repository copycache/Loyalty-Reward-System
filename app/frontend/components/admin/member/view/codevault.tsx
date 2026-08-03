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

interface CodevaultTabProps {
  slot: SlotData | null;
  active: boolean;
}

interface CodevaultFilters {
  status: string | null;
  search: string | null;
  id?: number;
}

const defaultFilters: CodevaultFilters = { status: null, search: null };

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

export function CodevaultTab({ slot, active }: CodevaultTabProps) {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState<CodevaultFilters>(defaultFilters);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [slot?.slot_id]);

  useEffect(() => {
    if (!active || !slot || !token) return;
    let cancelled = false;
    setData(null);
    apiPost<any>("/api/member/get_slot_codevault", { ...filters, id: slot.slot_id }, token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, [active, slot, token, filters]);

  return (
    <TabsContent value="codevault" className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filters.status ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, status: v === "all" ? null : v }))}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Status</SelectItem></SelectContent>
        </Select>
        <Input placeholder="Search code or pin" className="w-[200px]" value={filters.search ?? ""} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || null }))} />
        <div className="flex-1" />
        <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1" /> Export as PDF</Button>
        <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export as CSV</Button>
      </div>
      {!data ? <LoadingSpinner /> : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Pin</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.data ?? []).length > 0 ? (data.data ?? []).map((c: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{c.code_activation}</TableCell>
                  <TableCell>{c.code_pin}</TableCell>
                  <TableCell>{c.membership_name}</TableCell>
                  <TableCell>{c.slot_type}</TableCell>
                  <TableCell>{c.code_user_name !== "UNUSED" ? <>Used by <a href="javascript:void(0)" className="text-primary">{c.code_user_name}</a></> : <a href="javascript:void(0)" className="text-primary">UNUSED CODE</a>}</TableCell>
                  <TableCell>{c.code_user_name !== "UNUSED" ? c.code_date_used : "UNUSED"}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No codes found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </TabsContent>
  );
}