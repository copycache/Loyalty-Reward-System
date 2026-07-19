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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserPlus,
  Wallet,
  Users,
  Network,
  FileText,
  Award,
  ArrowUpDown,
  Shield,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SlotData {
  slot_id: number;
  slot_no: string;
  name: string;
  email: string;
  slot_sponsor_no: string;
  slot_placement_no: string;
  membership_name: string;
  slot_type: string;
  slot_status: string;
  slot_date_created: string;
  slot_date_placed_new: string;
  wallet: string | number;
  earning: string | number;
  cashin: string | number;
  voucher_wallet: string | number;
  [key: string]: any;
}

interface Filters {
  membership_id: string;
  type: string;
  kyc_status: string;
}

interface FilterOptions {
  membership: { membership_id: number; membership_name: string }[];
}

export default function AdminMembersPage() {
  const { token } = useAuthStore();
  const [members, setMembers] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    membership_id: "",
    type: "",
    kyc_status: "",
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    membership: [],
  });

  // Detail modal
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("info");
  const [slotInfo, setSlotInfo] = useState<any>(null);
  const [slotDetails, setSlotDetails] = useState<any>(null);
  const [slotEarnings, setSlotEarnings] = useState<any>(null);
  const [slotWallet, setSlotWallet] = useState<any>(null);
  const [slotPayout, setSlotPayout] = useState<any>(null);
  const [slotNetwork, setSlotNetwork] = useState<any>(null);

  // Add member modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    contact: "",
    username: "",
    password: "",
    sponsor: "",
    membership_id: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  // Adjust wallet modal
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    slot_id: "",
    amount: "",
    details: "",
  });
  const [adjustLoading, setAdjustLoading] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const body: any = {
        page,
        search,
        per_page: 15,
      };
      if (filters.membership_id) body.membership = filters.membership_id;
      if (filters.type) body.type = filters.type;
      if (filters.kyc_status) body.kyc_status = filters.kyc_status;

      const res = await apiPost<any>("/api/slot/get_full", body, token);
      // Handle both paginated and non-paginated responses
      if (res.data) {
        setMembers(res.data);
        setTotalPages(res.last_page || 1);
        setTotal(res.total || res.data.length);
      } else if (Array.isArray(res)) {
        setMembers(res);
        setTotalPages(1);
        setTotal(res.length);
      } else {
        setMembers([]);
      }
    } catch (err: any) {
      console.error("Failed to load members:", err);
      toast.error("Failed to load member list");
    }
    setLoading(false);
  }, [token, page, search, filters]);

  const loadFilters = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/slot/get_filters", {}, token);
      if (res?.membership) {
        setFilterOptions({ membership: res.membership });
      }
    } catch {
      // filters are optional
    }
  }, [token]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMembers();
  };

  const openDetail = async (slot: SlotData) => {
    setSelectedSlot(slot);
    setDetailOpen(true);
    setDetailTab("info");
    // Load slot information
    try {
      const info = await apiPost<any>(
        "/api/member/get_slot_information",
        { id: slot.slot_id },
        token
      );
      setSlotInfo(info);
    } catch {
      setSlotInfo(null);
    }
  };

  const loadDetailTab = async (tab: string) => {
    if (!selectedSlot) return;
    setDetailTab(tab);
    const slotId = selectedSlot.slot_id;

    try {
      switch (tab) {
        case "details": {
          const d = await apiPost<any>(
            "/api/member/get_slot_details",
            { id: slotId },
            token
          );
          setSlotDetails(d);
          break;
        }
        case "earnings": {
          const e = await apiPost<any>(
            "/api/member/get_slot_earnings",
            { id: slotId },
            token
          );
          setSlotEarnings(e);
          break;
        }
        case "wallet": {
          const w = await apiPost<any>(
            "/api/member/get_slot_wallet",
            { id: slotId },
            token
          );
          setSlotWallet(w);
          break;
        }
        case "payout": {
          const p = await apiPost<any>(
            "/api/member/get_slot_payout",
            { id: slotId },
            token
          );
          setSlotPayout(p);
          break;
        }
        case "network": {
          const n = await apiPost<any>(
            "/api/member/get_slot_network",
            { id: slotId },
            token
          );
          setSlotNetwork(n);
          break;
        }
      }
    } catch (err) {
      console.error(`Failed to load ${tab}:`, err);
    }
  };

  const handleAddMember = async () => {
    if (!token) return;
    setAddLoading(true);
    try {
      await apiPost("/api/member/add_member", {
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
      }, token);
      toast.success("Member added successfully");
      setAddOpen(false);
      setAddForm({
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        contact: "",
        username: "",
        password: "",
        sponsor: "",
        membership_id: "",
      });
      loadMembers();
    } catch (err: any) {
      if (err.errors) {
        const messages = Object.values(err.errors).flat();
        messages.forEach((msg: any) => toast.error(msg));
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add member");
      }
    }
    setAddLoading(false);
  };

  const handleAdjustWallet = async () => {
    if (!token) return;
    setAdjustLoading(true);
    try {
      await apiPost("/api/member/adjust_wallet", {
        slot_id: adjustForm.slot_id,
        amount: adjustForm.amount,
        plan: adjustForm.details || "MANUAL_ADJUSTMENT",
        trigger: "Admin Wallet Adjustment",
      }, token);
      toast.success("Wallet adjusted successfully");
      setAdjustOpen(false);
      setAdjustForm({ slot_id: "", amount: "", details: "" });
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust wallet");
    }
    setAdjustLoading(false);
  };

  const handleVerify = async (slotId: number, status: string) => {
    if (!token) return;
    try {
      await apiPost(
        "/api/member/user_verification",
        { id: slotId, status },
        token
      );
      toast.success(`Member ${status === "verified" ? "verified" : "rejected"}`);
      loadMembers();
      setDetailOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    }
  };

  const getKycBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>;
      case 2:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Member List</h1>
          <p className="text-muted-foreground">
            Manage members and slots ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setAdjustForm({ slot_id: "", amount: "", details: "" });
              setAdjustOpen(true);
            }}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Adjust Wallet
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <Select
              value={filters.membership_id}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, membership_id: v === "all" ? "" : v }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Memberships</SelectItem>
                {filterOptions.membership.map((m) => (
                  <SelectItem key={m.membership_id} value={String(m.membership_id)}>
                    {m.membership_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, type: v === "all" ? "" : v }))
              }
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
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, kyc_status: v === "all" ? "" : v }))
              }
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

            <Button variant="outline" onClick={() => { setPage(1); loadMembers(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.slot_id}>
                    <TableCell className="font-medium">{m.slot_no || "—"}</TableCell>
                    <TableCell>{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell>{m.slot_sponsor_no || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.membership_name || "—"}</Badge>
                    </TableCell>
                    <TableCell>{getKycBadge(Number(m.slot_status) || 0)}</TableCell>
                    <TableCell>{m.wallet ?? "0.00"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {m.slot_date_created || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(m)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
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
              {slotInfo ? (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(slotInfo).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase">
                        {key.replace(/_/g, " ")}
                      </Label>
                      <p className="text-sm font-medium">
                        {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}
                      </p>
                    </div>
                  ))}
                  {/* KYC Verification */}
                  {selectedSlot?.slot_status === "0" && (
                    <div className="col-span-2 flex gap-2 pt-4 border-t">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerify(selectedSlot.slot_id, "verified")}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Approve KYC
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleVerify(selectedSlot.slot_id, "rejected")}
                      >
                        Reject KYC
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {slotDetails ? (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(slotDetails).map(([key, value]) => (
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
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="earnings" className="mt-4">
              {slotEarnings ? (
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
                      slotEarnings.map((e: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{e.type || e.plan_name || "—"}</TableCell>
                          <TableCell>{e.amount ?? "0.00"}</TableCell>
                          <TableCell>{e.created_at ? new Date(e.created_at).toLocaleDateString() : "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          {typeof slotEarnings === "object" && !Array.isArray(slotEarnings)
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
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="wallet" className="mt-4">
              {slotWallet ? (
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
                    {Array.isArray(slotWallet?.data || slotWallet) &&
                    (slotWallet?.data || slotWallet).length > 0 ? (
                      (slotWallet?.data || slotWallet).map((w: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{w.details || w.description || "—"}</TableCell>
                          <TableCell
                            className={
                              Number(w.amount) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {w.amount}
                          </TableCell>
                          <TableCell>{w.balance ?? "—"}</TableCell>
                          <TableCell>
                            {w.created_at
                              ? new Date(w.created_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
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
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="payout" className="mt-4">
              {slotPayout ? (
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
                    {Array.isArray(slotPayout?.data || slotPayout) &&
                    (slotPayout?.data || slotPayout).length > 0 ? (
                      (slotPayout?.data || slotPayout).map((p: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{p.amount ?? "0.00"}</TableCell>
                          <TableCell>{p.method_name || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{p.status || "—"}</Badge>
                          </TableCell>
                          <TableCell>
                            {p.created_at
                              ? new Date(p.created_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
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
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="network" className="mt-4">
              {slotNetwork ? (
                <div className="space-y-2">
                  {Array.isArray(slotNetwork) ? (
                    slotNetwork.map((n: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
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
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-10">
                      No network data available
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={addForm.first_name}
                onChange={(e) => setAddForm((f) => ({ ...f, first_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={addForm.last_name}
                onChange={(e) => setAddForm((f) => ({ ...f, last_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Middle Name</Label>
              <Input
                value={addForm.middle_name}
                onChange={(e) => setAddForm((f) => ({ ...f, middle_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact</Label>
              <Input
                value={addForm.contact}
                onChange={(e) => setAddForm((f) => ({ ...f, contact: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={addForm.username}
                onChange={(e) => setAddForm((f) => ({ ...f, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Sponsor Username</Label>
              <Input
                value={addForm.sponsor}
                onChange={(e) => setAddForm((f) => ({ ...f, sponsor: e.target.value }))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Membership</Label>
              <Select
                value={addForm.membership_id}
                onValueChange={(v) => setAddForm((f) => ({ ...f, membership_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select membership" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.membership.map((m) => (
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

      {/* Adjust Wallet Modal */}
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
                onChange={(e) =>
                  setAdjustForm((f) => ({ ...f, slot_id: e.target.value }))
                }
                placeholder="Enter slot ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (use negative for deduction)</Label>
              <Input
                type="number"
                value={adjustForm.amount}
                onChange={(e) =>
                  setAdjustForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Details / Reason</Label>
              <Input
                value={adjustForm.details}
                onChange={(e) =>
                  setAdjustForm((f) => ({ ...f, details: e.target.value }))
                }
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
