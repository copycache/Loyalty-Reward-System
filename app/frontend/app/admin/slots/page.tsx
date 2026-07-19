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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Network,
  User,
  Wallet,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SlotItem {
  slot_id: number;
  slot_no: string;
  name: string;
  email: string;
  membership_name?: string;
  status?: string;
  type?: string;
  ranking_name?: string;
  wallet?: number;
  cashin?: number;
  earning?: number;
  voucher_wallet?: number;
  slot_date_created?: string;
  slot_date_placed_new?: string;
  slot_sponsor_no?: string;
  slot_placement_no?: string;
  verified?: string | number;
}

interface Filters {
  ranks: any[];
  membership: any[];
  livewell_rank: any[];
}

export default function AdminSlotsPage() {
  const { token } = useAuthStore();
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filters, setFilters] = useState<Filters>({ ranks: [], membership: [], livewell_rank: [] });
  const [membershipFilter, setMembershipFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [kycFilter, setKycFilter] = useState("");

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotInfo, setSlotInfo] = useState<any>(null);
  const [infoLoading, setInfoLoading] = useState(false);

  const loadSlots = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const body: any = { page, search };
      if (membershipFilter) body.membership = membershipFilter;
      if (typeFilter) body.type = typeFilter;
      if (kycFilter) body.kyc_status = kycFilter;

      const res = await apiPost<any>("/api/slot/get_full", body, token);
      if (res?.data) {
        setSlots(res.data);
        setTotalPages(res.last_page || 1);
        setTotal(res.total || 0);
      } else if (Array.isArray(res)) {
        setSlots(res);
        setTotalPages(1);
        setTotal(res.length);
      } else {
        setSlots([]);
      }
    } catch (err: any) {
      console.error("Failed to load slots:", err);
      toast.error("Failed to load slots");
    }
    setLoading(false);
  }, [token, page, search, membershipFilter, typeFilter, kycFilter]);

  const loadFilters = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/slot/get_filters", {}, token);
      if (res) setFilters(res);
    } catch { /* optional */ }
  }, [token]);

  useEffect(() => { loadSlots(); }, [loadSlots]);
  useEffect(() => { loadFilters(); }, [loadFilters]);

  const openSlotDetail = async (slot: SlotItem) => {
    setSelectedSlot(slot);
    setDetailOpen(true);
    setInfoLoading(true);
    try {
      const res = await apiPost<any>("/api/member/get_slot_information", { id: slot.slot_id }, token);
      setSlotInfo(res);
    } catch {
      setSlotInfo(null);
    }
    setInfoLoading(false);
  };

  const kycLabel = (status: string | number | undefined) => {
    switch (String(status)) {
      case "1": return { text: "Verified", color: "bg-green-100 text-green-800" };
      case "2": return { text: "Pending", color: "bg-yellow-100 text-yellow-800" };
      case "3": return { text: "Rejected", color: "bg-red-100 text-red-800" };
      default: return { text: "Unverified", color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Slot Management</h1>
          <p className="text-muted-foreground">
            View and manage all member slots ({total} total)
          </p>
        </div>
        <Button variant="outline" onClick={() => { setPage(1); loadSlots(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <form
              onSubmit={(e) => { e.preventDefault(); setPage(1); loadSlots(); }}
              className="flex gap-2 flex-1 min-w-[250px]"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <Select value={membershipFilter || "all"} onValueChange={(v) => { setMembershipFilter(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Membership</SelectItem>
                {filters.membership.map((m: any) => (
                  <SelectItem key={m.membership_id} value={String(m.membership_id)}>
                    {m.membership_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter || "all"} onValueChange={(v) => { setTypeFilter(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={kycFilter || "all"} onValueChange={(v) => { setKycFilter(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="KYC Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC</SelectItem>
                <SelectItem value="0">Unverified</SelectItem>
                <SelectItem value="1">Verified</SelectItem>
                <SelectItem value="2">Pending</SelectItem>
                <SelectItem value="3">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Slots Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot No</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : slots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                    No slots found
                  </TableCell>
                </TableRow>
              ) : (
                slots.map((s) => {
                  const kyc = kycLabel(s.verified);
                  return (
                    <TableRow key={s.slot_id}>
                      <TableCell className="font-mono">{s.slot_no || "—"}</TableCell>
                      <TableCell className="font-medium">{s.email || "—"}</TableCell>
                      <TableCell>{s.name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.membership_name || "—"}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{s.slot_sponsor_no || "—"}</TableCell>
                      <TableCell>₱{Number(s.wallet || 0).toLocaleString()}</TableCell>
                      <TableCell>₱{Number(s.earning || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`${kyc.color} hover:opacity-90`}>{kyc.text}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.slot_date_created || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openSlotDetail(s)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      {/* Slot Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Slot Details — {selectedSlot?.slot_no}
            </DialogTitle>
          </DialogHeader>

          {infoLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : slotInfo ? (
            <div className="space-y-6">
              {/* Owner Info */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" /> Owner Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="text-sm font-medium">
                      {slotInfo.name || `${slotInfo.first_name || ""} ${slotInfo.last_name || ""}`.trim()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-sm font-medium">{slotInfo.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Contact</Label>
                    <p className="text-sm">{slotInfo.contact || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Slot Info */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Network className="h-4 w-4" /> Slot Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Slot Number</Label>
                    <p className="text-sm font-mono">{slotInfo.slot_no}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Membership</Label>
                    <p className="text-sm">{slotInfo.membership_name || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sponsor Code</Label>
                    <p className="text-sm font-mono">{slotInfo.slot_sponsor_code || slotInfo.slot_sponsor_no || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Placement Code</Label>
                    <p className="text-sm font-mono">{slotInfo.slot_placement_code || slotInfo.slot_placement_no || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Date Created</Label>
                    <p className="text-sm">{slotInfo.slot_date_created || selectedSlot?.slot_date_created || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Date Placed</Label>
                    <p className="text-sm">{slotInfo.slot_date_placed_new || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Wallet Info */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Wallet className="h-4 w-4" /> Financial
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">Wallet</p>
                      <p className="text-lg font-bold">₱{Number(selectedSlot?.wallet || slotInfo.wallet || 0).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">Cash-In</p>
                      <p className="text-lg font-bold">₱{Number(selectedSlot?.cashin || slotInfo.cashin || 0).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">Earnings</p>
                      <p className="text-lg font-bold">₱{Number(selectedSlot?.earning || slotInfo.earning || 0).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Beneficiary */}
              {(slotInfo.beneficiary_first_name || slotInfo.beneficiary_last_name) && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Beneficiary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="text-sm">
                        {`${slotInfo.beneficiary_first_name || ""} ${slotInfo.beneficiary_middle_name || ""} ${slotInfo.beneficiary_last_name || ""}`.trim()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Contact</Label>
                      <p className="text-sm">{slotInfo.beneficiary_contact || "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No slot information available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
