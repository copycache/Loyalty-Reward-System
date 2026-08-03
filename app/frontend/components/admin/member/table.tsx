"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { Eye, ChevronLeft, ChevronRight, Search, RefreshCw } from "lucide-react";

interface SlotData {
  slot_id: number;
  slot_id_number?: string | number;
  slot_no: string;
  name: string;
  email: string;
  slot_sponsor_no: string;
  slot_placement_no: string;
  slot_position: string;
  membership_name: string;
  membership_id?: number | string;
  slot_type: string;
  slot_status: string;
  slot_date_created: string;
  slot_date_placed_new?: string;
  wallet: string | number;
  earning: string | number;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
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

const PAGE_SIZE = 15;
const TABLE_COLUMN_COUNT = 12;

export interface MembersTableHandle {
  refresh: () => Promise<void>;
  getMembershipOptions: () => MembershipOption[];
}

interface Props {
  onView: (member: SlotData) => void;
}

function KycBadge({ status }: { status: number }) {
  if (status === 1) return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
  if (status === 2) return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
  if (status === 3) return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

export default forwardRef<MembersTableHandle, Props>(function MembersTable({ onView }, ref) {
  const { token } = useAuthStore();

  const [allMembers, setAllMembers] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({ membership_id: "", type: "", kyc_status: "" });

  async function loadMembers() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiPost<MembersResponse | SlotData[]>(
        "/api/slot/get_full",
        {
          membership: "all",
          type: "all",
          ranking: "all",
          search: "",
          membership_status: "all",
          kyc_status: "all",
        },
        token
      );
      if (Array.isArray(res)) setAllMembers(res);
      else if (res.data) setAllMembers(res.data);
      else setAllMembers([]);
    } catch (err) {
      console.error("Failed to load members:", err);
      toast.error("Failed to load member list");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, [token]);

  const seenMemberships = new Map<string, MembershipOption>();
  for (const m of allMembers) {
    if (m.membership_id == null || !m.membership_name) continue;
    const key = String(m.membership_id);
    if (!seenMemberships.has(key)) {
      seenMemberships.set(key, { membership_id: m.membership_id, membership_name: m.membership_name });
    }
  }
  const membershipOptions = Array.from(seenMemberships.values()).sort((a, b) =>
    a.membership_name.localeCompare(b.membership_name)
  );

  const optionsRef = useRef(membershipOptions);
  optionsRef.current = membershipOptions;

  useImperativeHandle(ref, () => ({
    refresh: loadMembers,
    getMembershipOptions: () => optionsRef.current,
  }));

  let filteredMembers = allMembers;
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filteredMembers = filteredMembers.filter((m) =>
      [m.name, m.email, m.slot_no, m.slot_sponsor_no].filter(Boolean).some((f) => String(f).toLowerCase().includes(q))
    );
  }
  if (filters.membership_id) {
    filteredMembers = filteredMembers.filter((m) => String(m.membership_id ?? "") === filters.membership_id);
  }
  if (filters.type) {
    filteredMembers = filteredMembers.filter((m) =>
      filters.type === "placed" ? !!m.slot_placement_no : !m.slot_placement_no
    );
  }
  if (filters.kyc_status) {
    filteredMembers = filteredMembers.filter((m) => String(m.slot_status) === filters.kyc_status);
  }

  const total = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pagedMembers = filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function goToPage(next: number) {
    setPage(next);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or slot..."
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
                <SelectItem value="all">All Membership</SelectItem>
                {membershipOptions.map((m) => (
                  <SelectItem key={String(m.membership_id)} value={String(m.membership_id)}>
                    {m.membership_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v === "all" ? "" : v }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Type</SelectItem>
                <SelectItem value="placed">Paid Slot</SelectItem>
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="1">Verified</SelectItem>
                <SelectItem value="3">Rejected</SelectItem>
                <SelectItem value="2">For Approval</SelectItem>
                <SelectItem value="0">No Valid ID</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadMembers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={TABLE_COLUMN_COUNT}>
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : pagedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={TABLE_COLUMN_COUNT} className="text-center py-10 text-muted-foreground">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                pagedMembers.map((m) => (
                  <TableRow key={m.slot_id}>
                    <TableCell>{m.slot_no}</TableCell>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>{m.slot_sponsor_no || "—"}</TableCell>
                    <TableCell>{m.slot_placement_no || "—"}</TableCell>
                    <TableCell>{m.slot_position || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.membership_name}</Badge>
                    </TableCell>
                    <TableCell>{m.slot_type || "—"}</TableCell>
                    <TableCell>{m.slot_date_created}</TableCell>
                    <TableCell>
                      <KycBadge status={Number(m.slot_status)} />
                    </TableCell>
                    <TableCell>{m.wallet}</TableCell>
                    <TableCell>{m.earning}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onView(m)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p>
                Page {page} of {totalPages}
              </p>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});