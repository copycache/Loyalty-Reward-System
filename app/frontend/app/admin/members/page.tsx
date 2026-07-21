"use client";

import MembersTable from "@/components/page/member-list/table";
import { useEffect, useMemo, useState, useCallback } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserPlus,
  Wallet,
  Users,
  Network,
  Shield,
} from "lucide-react";

// --- Types ---

interface SlotData {
  slot_id: number;
  slot_no: string;
  name: string;
  email: string;
  slot_sponsor_no: string;
  slot_placement_no: string;
  membership_name: string;
  membership_id?: number | string;
  slot_type: string;
  slot_status: string; // "0" = pending, "1" = verified, "2" = rejected
  slot_date_created: string;
  slot_date_placed_new: string;
  wallet: string | number;
  earning: string | number;
  cashin: string | number;
  voucher_wallet: string | number;
}

interface MembersResponse {
  data?: SlotData[];
  last_page?: number;
  total?: number;
}

interface Filters {
  membership_id: string;
  type: string;
  kyc_status: string;
}

interface MembershipOption {
  membership_id: number | string;
  membership_name: string;
}

interface AddMemberForm {
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  contact: string;
  username: string;
  password: string;
  sponsor: string;
  membership_id: string;
}

interface AdjustWalletForm {
  slot_id: string;
  amount: string;
  details: string;
}

// Detail tabs load different data shapes from different endpoints.
// We keep these loosely typed since they're admin-facing debug/raw data,
// but named clearly so it's obvious what each one holds.
type DetailRecord = Record<string, unknown>;
type EarningRecord = { type?: string; plan_name?: string; amount?: number | string; created_at?: string };
type WalletRecord = { details?: string; description?: string; amount: number | string; balance?: number | string; created_at?: string };
type PayoutRecord = { amount?: number | string; method_name?: string; status?: string; created_at?: string };
type NetworkRecord = { name?: string; slot_id?: number; membership_name?: string; position?: string; status?: string };

type DetailTab = "info" | "details" | "earnings" | "wallet" | "payout" | "network";

const EMPTY_ADD_FORM: AddMemberForm = {
  first_name: "",
  last_name: "",
  middle_name: "",
  email: "",
  contact: "",
  username: "",
  password: "",
  sponsor: "",
  membership_id: "",
};

const EMPTY_ADJUST_FORM: AdjustWalletForm = { slot_id: "", amount: "", details: "" };

const PAGE_SIZE = 15;

// --- Small reusable pieces ---

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

// KYC status comes back from the API as a number (0/1/2). This maps it
// to a readable, colored badge.
function KycBadge({ status }: { status: number }) {
  if (status === 1) {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>;
  }
  if (status === 2) {
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
  }
  return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
}

// Renders an object as a grid of "LABEL: value" pairs. Used for the raw
// "info" and "details" tabs, which return whatever fields the API sends.
function KeyValueGrid({ data }: { data: DetailRecord }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase">
            {key.replace(/_/g, " ")}
          </Label>
          <p className="text-sm font-medium">
            {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}
          </p>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateString?: string) {
  return dateString ? new Date(dateString).toLocaleDateString() : "—";
}

// Some endpoints return `{ data: [...] }`, others return a bare array.
// This normalizes both shapes into a plain array we can safely .map() over.
function toArray<T>(value: T[] | { data?: T[] } | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
}

export default function AdminMembersPage() {
  const { token } = useAuthStore();

  // --- Members list state ---
  // `allMembers` holds the full, unfiltered list fetched from the backend.
  // Search, filtering, pagination, AND the membership dropdown options are
  // all derived from this on the frontend — no separate filters endpoint.
  const [allMembers, setAllMembers] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // live input, applied to `search` on submit
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    membership_id: "",
    type: "",
    kyc_status: "",
  });

  // --- Detail modal state ---
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("info");
  const [slotInfo, setSlotInfo] = useState<DetailRecord | null>(null);
  const [slotDetails, setSlotDetails] = useState<DetailRecord | null>(null);
  const [slotEarnings, setSlotEarnings] = useState<EarningRecord[] | DetailRecord | null>(null);
  const [slotWallet, setSlotWallet] = useState<WalletRecord[] | null>(null);
  const [slotPayout, setSlotPayout] = useState<PayoutRecord[] | null>(null);
  const [slotNetwork, setSlotNetwork] = useState<NetworkRecord[] | null>(null);

  // --- Add member modal state ---
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddMemberForm>(EMPTY_ADD_FORM);
  const [addLoading, setAddLoading] = useState(false);

  // --- Adjust wallet modal state ---
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState<AdjustWalletForm>(EMPTY_ADJUST_FORM);
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Fetches the full member list from the backend. No search/filter/page
  // params are sent at all — this is a plain "give me the members" call.
  // Search, filtering, and pagination are handled entirely client-side
  // below (see `filteredMembers` / `pagedMembers`).
  const loadMembers = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await apiPost<MembersResponse | SlotData[]>("/api/slot/get_full", {}, token);

      // The API can return either a paginated object ({ data, last_page, total })
      // or a plain array, depending on the endpoint's mood. Handle both.
      if (Array.isArray(res)) {
        setAllMembers(res);
      } else if (res.data) {
        setAllMembers(res.data);
      } else {
        setAllMembers([]);
      }
    } catch (err) {
      console.error("Failed to load members:", err);
      toast.error("Failed to load member list");
    }

    setLoading(false);
  }, [token]);

  // Load the full member list once on mount. `loadMembers` is called again
  // later only to resync with the backend after a mutation (add member,
  // adjust wallet, verify/reject) — never for search/filter/paging.
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Membership dropdown options, derived from whatever memberships actually
  // appear in the loaded member list — no /api/slot/get_filters call.
  const membershipOptions = useMemo<MembershipOption[]>(() => {
    const seen = new Map<string, MembershipOption>();
    for (const m of allMembers) {
      if (m.membership_id == null || !m.membership_name) continue;
      const key = String(m.membership_id);
      if (!seen.has(key)) {
        seen.set(key, { membership_id: m.membership_id, membership_name: m.membership_name });
      }
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.membership_name.localeCompare(b.membership_name)
    );
  }, [allMembers]);

  // --- Client-side search + filtering ---
  const filteredMembers = useMemo(() => {
    let result = allMembers;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((m) =>
        [m.name, m.email, m.slot_no, m.slot_sponsor_no]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q))
      );
    }

    if (filters.membership_id) {
      result = result.filter(
        (m) => String(m.membership_id ?? "") === filters.membership_id
      );
    }

    if (filters.type) {
      result = result.filter((m) =>
        filters.type === "placed" ? !!m.slot_placement_no : !m.slot_placement_no
      );
    }

    if (filters.kyc_status) {
      result = result.filter((m) => String(m.slot_status) === filters.kyc_status);
    }

    return result;
  }, [allMembers, search, filters]);

  // --- Client-side pagination over the filtered set ---
  const total = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pagedMembers = useMemo(
    () => filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredMembers, page]
  );

  // Reset to page 1 whenever search/filters change so we don't get stuck
  // on a page that no longer has any results.
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  // Opens the detail modal for a member and loads their "info" tab
  // (the other tabs load on-demand when clicked, see loadDetailTab).
  async function openDetail(slot: SlotData) {
    setSelectedSlot(slot);
    setDetailOpen(true);
    setDetailTab("info");

    try {
      const info = await apiPost<DetailRecord>(
        "/api/member/get_slot_information",
        { id: slot.slot_id },
        token
      );
      setSlotInfo(info);
    } catch {
      setSlotInfo(null);
    }
  }

  // Each tab in the detail modal hits its own endpoint, fetched lazily
  // the first time the user clicks that tab.
  async function loadDetailTab(tab: string) {
    if (!selectedSlot) return;
    setDetailTab(tab as DetailTab);
    const slotId = selectedSlot.slot_id;

    try {
      switch (tab as DetailTab) {
        case "details": {
          const data = await apiPost<DetailRecord>("/api/member/get_slot_details", { id: slotId }, token);
          setSlotDetails(data);
          break;
        }
        case "earnings": {
          const data = await apiPost<EarningRecord[] | DetailRecord>(
            "/api/member/get_slot_earnings",
            { id: slotId },
            token
          );
          setSlotEarnings(data);
          break;
        }
        case "wallet": {
          const data = await apiPost<WalletRecord[] | { data: WalletRecord[] }>(
            "/api/member/get_slot_wallet",
            { id: slotId },
            token
          );
          setSlotWallet(toArray(data));
          break;
        }
        case "payout": {
          const data = await apiPost<PayoutRecord[] | { data: PayoutRecord[] }>(
            "/api/member/get_slot_payout",
            { id: slotId },
            token
          );
          setSlotPayout(toArray(data));
          break;
        }
        case "network": {
          const data = await apiPost<NetworkRecord[]>("/api/member/get_slot_network", { id: slotId }, token);
          setSlotNetwork(data);
          break;
        }
      }
    } catch (err) {
      console.error(`Failed to load ${tab}:`, err);
    }
  }

  async function handleAddMember() {
    if (!token) return;
    setAddLoading(true);

    try {
      await apiPost(
        "/api/member/add_member",
        {
          first_name: addForm.first_name,
          last_name: addForm.last_name,
          middle_name: addForm.middle_name,
          email: addForm.email,
          contact: addForm.contact,
          username: addForm.username,
          password: addForm.password,
          slot_referral: addForm.sponsor,
          membership_id: addForm.membership_id,
          register_platform: "system",
          country_id: 1,
          slot_link: "referral",
        },
        token
      );

      toast.success("Member added successfully");
      setAddOpen(false);
      setAddForm(EMPTY_ADD_FORM);
      loadMembers();
    } catch (err) {
      // Laravel validation errors come back as { errors: { field: [messages] } }.
      // Show each one individually so the user knows exactly what to fix.
      if (err && typeof err === "object" && "errors" in err && err.errors) {
        const messages = Object.values(err.errors as Record<string, string[]>).flat();
        messages.forEach((msg) => toast.error(msg));
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add member");
      }
    }

    setAddLoading(false);
  }

  async function handleAdjustWallet() {
    if (!token) return;
    setAdjustLoading(true);

    try {
      await apiPost(
        "/api/member/adjust_wallet",
        {
          slot_id: adjustForm.slot_id,
          amount: adjustForm.amount,
          plan: adjustForm.details || "MANUAL_ADJUSTMENT",
          trigger: "Admin Wallet Adjustment",
        },
        token
      );

      toast.success("Wallet adjusted successfully");
      setAdjustOpen(false);
      setAdjustForm(EMPTY_ADJUST_FORM);
      loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to adjust wallet");
    }

    setAdjustLoading(false);
  }

  async function handleVerify(slotId: number, status: "verified" | "rejected") {
    if (!token) return;

    try {
      await apiPost("/api/member/user_verification", { id: slotId, status }, token);
      toast.success(`Member ${status === "verified" ? "verified" : "rejected"}`);
      loadMembers();
      setDetailOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Member List</h1>
          <p className="text-muted-foreground">Manage members and slots ({total} total)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button variant="outline" onClick={() => { setAdjustForm(EMPTY_ADJUST_FORM); setAdjustOpen(true); }}>
            <Wallet className="h-4 w-4 mr-2" />
            Adjust Wallet
          </Button>
        </div>
      </div>

      {/* --- Filters --- */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <Select
              value={filters.membership_id}
              onValueChange={(v) => setFilters((f) => ({ ...f, membership_id: v === "all" ? "" : v }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Memberships</SelectItem>
                {membershipOptions.map((m) => (
                  <SelectItem key={m.membership_id} value={String(m.membership_id)}>
                    {m.membership_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type}
              onValueChange={(v) => setFilters((f) => ({ ...f, type: v === "all" ? "" : v }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="unplaced">Unplaced</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.kyc_status}
              onValueChange={(v) => setFilters((f) => ({ ...f, kyc_status: v === "all" ? "" : v }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="KYC Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC</SelectItem>
                <SelectItem value="0">Pending</SelectItem>
                <SelectItem value="1">Verified</SelectItem>
                <SelectItem value="2">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => loadMembers()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- Members table --- */}
      <MembersTable
        loading={loading}
        members={pagedMembers}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onView={openDetail}
      />

      {/* --- Detail modal --- */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Slot Information — {selectedSlot?.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={detailTab} onValueChange={loadDetailTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="payout">Payout</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              {!slotInfo ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <KeyValueGrid data={slotInfo} />
                  {/* Only members still pending KYC review get approve/reject buttons */}
                  {selectedSlot?.slot_status === "0" && (
                    <div className="col-span-2 flex gap-2 pt-4 border-t">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => selectedSlot && handleVerify(selectedSlot.slot_id, "verified")}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Approve KYC
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => selectedSlot && handleVerify(selectedSlot.slot_id, "rejected")}
                      >
                        Reject KYC
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {slotDetails ? <KeyValueGrid data={slotDetails} /> : <LoadingSpinner />}
            </TabsContent>

            <TabsContent value="earnings" className="mt-4">
              {!slotEarnings ? (
                <LoadingSpinner />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(slotEarnings) && slotEarnings.length > 0 ? (
                      slotEarnings.map((e, i) => (
                        <TableRow key={i}>
                          <TableCell>{e.type || e.plan_name || "—"}</TableCell>
                          <TableCell>{e.amount ?? "0.00"}</TableCell>
                          <TableCell>{formatDate(e.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          {/* If it wasn't an array, it's probably a summary object — show it as key/value rows */}
                          {!Array.isArray(slotEarnings)
                            ? Object.entries(slotEarnings).map(([k, v]) => (
                                <div key={k} className="flex justify-between py-1">
                                  <span className="capitalize">{k.replace(/_/g, " ")}</span>
                                  <span className="font-medium">{String(v)}</span>
                                </div>
                              ))
                            : "No earnings found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="wallet" className="mt-4">
              {!slotWallet ? (
                <LoadingSpinner />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Details</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slotWallet.length > 0 ? (
                      slotWallet.map((w, i) => (
                        <TableRow key={i}>
                          <TableCell>{w.details || w.description || "—"}</TableCell>
                          <TableCell className={Number(w.amount) >= 0 ? "text-green-600" : "text-red-600"}>
                            {w.amount}
                          </TableCell>
                          <TableCell>{w.balance ?? "—"}</TableCell>
                          <TableCell>{formatDate(w.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No wallet transactions
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="payout" className="mt-4">
              {!slotPayout ? (
                <LoadingSpinner />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slotPayout.length > 0 ? (
                      slotPayout.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell>{p.amount ?? "0.00"}</TableCell>
                          <TableCell>{p.method_name || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{p.status || "—"}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(p.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No payout history
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="network" className="mt-4">
              {!slotNetwork ? (
                <LoadingSpinner />
              ) : slotNetwork.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No network data available</p>
              ) : (
                <div className="space-y-2">
                  {slotNetwork.map((n, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Network className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{n.name || n.slot_id}</p>
                          <p className="text-xs text-muted-foreground">
                            {n.membership_name} • {n.position || "—"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{n.status || "Active"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* --- Add member modal --- */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={addForm.first_name} onChange={(e) => setAddForm((f) => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={addForm.last_name} onChange={(e) => setAddForm((f) => ({ ...f, last_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Middle Name</Label>
              <Input value={addForm.middle_name} onChange={(e) => setAddForm((f) => ({ ...f, middle_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Contact</Label>
              <Input value={addForm.contact} onChange={(e) => setAddForm((f) => ({ ...f, contact: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={addForm.username} onChange={(e) => setAddForm((f) => ({ ...f, username: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Sponsor Username</Label>
              <Input value={addForm.sponsor} onChange={(e) => setAddForm((f) => ({ ...f, sponsor: e.target.value }))} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Membership</Label>
              <Select value={addForm.membership_id} onValueChange={(v) => setAddForm((f) => ({ ...f, membership_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select membership" />
                </SelectTrigger>
                <SelectContent>
                  {membershipOptions.map((m) => (
                    <SelectItem key={m.membership_id} value={String(m.membership_id)}>
                      {m.membership_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={addLoading}>
              {addLoading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Adjust wallet modal --- */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Slot ID</Label>
              <Input
                value={adjustForm.slot_id}
                onChange={(e) => setAdjustForm((f) => ({ ...f, slot_id: e.target.value }))}
                placeholder="Enter slot ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (use negative for deduction)</Label>
              <Input
                type="number"
                value={adjustForm.amount}
                onChange={(e) => setAdjustForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Details / Reason</Label>
              <Input
                value={adjustForm.details}
                onChange={(e) => setAdjustForm((f) => ({ ...f, details: e.target.value }))}
                placeholder="Reason for adjustment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustWallet} disabled={adjustLoading}>
              {adjustLoading ? "Processing..." : "Adjust"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}