"use client";

import MembersTable from "@/components/page/member-list/table";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogClose,
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
  RefreshCw,
  UserPlus,
  Wallet,
  Users,
  Network,
  Shield,
  Ban,
  Dot,
  History,
  Save,
  QrCode,
  Rocket,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

interface AddMemberForm {
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  contact: string;
  username: string;
  password: string;
  sponsor: string;
  country_id: string;
}

interface CreateSlotForm {
  code: string;
  pin: string;
  slot_owner: string;
  slot_sponsor: string;
}

interface PlaceSlotForm {
  slot_code: string;
  slot_placement: string;
  slot_position: string;
}

interface SlotLimitForm {
  slot_owner: string;
  slot_limit: string;
  all_member: boolean;
}

interface ResetDataForm {
  security_key: string;
  member_list: boolean;
  slot_list: boolean;
  plan_settings: boolean;
  generated_codes: boolean;
  product_list: boolean;
}

type DetailTab = "info" | "details" | "earnings" | "distributed" | "wallet" | "payout" | "points" | "network" | "codevault";

const PAGE_SIZE = 15;
const EMPTY_ADD: AddMemberForm = { first_name: "", last_name: "", middle_name: "", email: "", contact: "", username: "", password: "", sponsor: "", country_id: "" };
const EMPTY_CREATE_SLOT: CreateSlotForm = { code: "", pin: "", slot_owner: "", slot_sponsor: "" };
const EMPTY_PLACE_SLOT: PlaceSlotForm = { slot_code: "", slot_placement: "", slot_position: "LEFT" };
const EMPTY_SLOT_LIMIT: SlotLimitForm = { slot_owner: "", slot_limit: "", all_member: false };
const EMPTY_RESET: ResetDataForm = { security_key: "", member_list: true, slot_list: true, plan_settings: false, generated_codes: false, product_list: false };

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

function KycBadge({ status }: { status: number }) {
  if (status === 1) return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
  if (status === 2) return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
  if (status === 3) return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
}

function formatDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return d; }
}

function formatDateTime(d?: string) {
  if (!d) return "—";
  try { const dt = new Date(d); return `${dt.toLocaleDateString()} (${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`; } catch { return d; }
}

function toArray<T>(v: T[] | { data?: T[] } | null | undefined): T[] {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray((v as { data?: T[] }).data)) return (v as { data: T[] }).data;
  return [];
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 min-h-[28px]">
      <span className="text-xs text-muted-foreground w-[140px] text-right shrink-0">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

export default function AdminMembersPage() {
  const { token } = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const [allMembers, setAllMembers] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({ membership_id: "", type: "", kyc_status: "" });
  const [hiddenPass, setHiddenPass] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("info");
  const [slotInfo, setSlotInfo] = useState<Record<string, any> | null>(null);
  const [slotDetails, setSlotDetails] = useState<Record<string, any> | null>(null);
  const [slotEarnings, setSlotEarnings] = useState<any>(null);
  const [slotDistributed, setSlotDistributed] = useState<any>(null);
  const [slotWallet, setSlotWallet] = useState<any>(null);
  const [slotPayout, setSlotPayout] = useState<any>(null);
  const [slotPoints, setSlotPoints] = useState<any>(null);
  const [slotNetwork, setSlotNetwork] = useState<any>(null);
  const [slotCodevault, setSlotCodevault] = useState<any>(null);
  const [detailFilters, setDetailFilters] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [planList, setPlanList] = useState<any[]>([]);
  const [countryList, setCountryList] = useState<any[]>([]);
  const [currencyList, setCurrencyList] = useState<any>([]);
  const [memberSearchList, setMemberSearchList] = useState<any[]>([]);
  const [unplacedSlotList, setUnplacedSlotList] = useState<any[]>([]);
  const [memberLimitList, setMemberLimitList] = useState<any[]>([]);
  const [slotCodeHistory, setSlotCodeHistory] = useState<any>(null);
  const [infoSlotList, setInfoSlotList] = useState<any[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddMemberForm>(EMPTY_ADD);
  const [addLoading, setAddLoading] = useState(false);

  const [createSlotOpen, setCreateSlotOpen] = useState(false);
  const [createSlotForm, setCreateSlotForm] = useState<CreateSlotForm>(EMPTY_CREATE_SLOT);
  const [createSlotLoading, setCreateSlotLoading] = useState(false);
  const [createSlotSearch, setCreateSlotSearch] = useState("");

  const [placeSlotOpen, setPlaceSlotOpen] = useState(false);
  const [placeSlotForm, setPlaceSlotForm] = useState<PlaceSlotForm>(EMPTY_PLACE_SLOT);
  const [placeSlotLoading, setPlaceSlotLoading] = useState(false);
  const [placeSlotSearch, setPlaceSlotSearch] = useState("");

  const [slotLimitOpen, setSlotLimitOpen] = useState(false);
  const [slotLimitForm, setSlotLimitForm] = useState<SlotLimitForm>(EMPTY_SLOT_LIMIT);
  const [slotLimitLoading, setSlotLimitLoading] = useState(false);
  const [slotLimitSearch, setSlotLimitSearch] = useState("");
  const [slotLimitData, setSlotLimitData] = useState<any>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetForm, setResetForm] = useState<ResetDataForm>(EMPTY_RESET);
  const [resetLoading, setResetLoading] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustId, setAdjustId] = useState("");
  const [adjustCode, setAdjustCode] = useState("");
  const [adjustTrigger, setAdjustTrigger] = useState("1");
  const [adjustCurrencyId, setAdjustCurrencyId] = useState("");
  const [adjustPlan, setAdjustPlan] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("0");
  const [adjustLoading, setAdjustLoading] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiPost<MembersResponse | SlotData[]>("/api/slot/get_full", {}, token);
      if (Array.isArray(res)) setAllMembers(res);
      else if (res.data) setAllMembers(res.data);
      else setAllMembers([]);
    } catch (err) {
      console.error("Failed to load members:", err);
      toast.error("Failed to load member list");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  useEffect(() => {
    if (!token) return;
    apiPost<any[]>("/api/member/get_plan_list", {}, token).then(setPlanList).catch(() => {});
    apiPost<any[]>("/api/country/get", {}, token).then((r) => { setCountryList(Array.isArray(r) ? r : []); }).catch(() => {});
    apiPost("/api/slot/get_currency", {}, token).then((r: any) => {
      setCurrencyList(r);
      if (r?.default_currency) setAdjustCurrencyId(r.default_currency.currency_id);
    }).catch(() => {});
  }, [token]);

  const membershipOptions = useMemo<MembershipOption[]>(() => {
    const seen = new Map<string, MembershipOption>();
    for (const m of allMembers) {
      if (m.membership_id == null || !m.membership_name) continue;
      const key = String(m.membership_id);
      if (!seen.has(key)) seen.set(key, { membership_id: m.membership_id, membership_name: m.membership_name });
    }
    return Array.from(seen.values()).sort((a, b) => a.membership_name.localeCompare(b.membership_name));
  }, [allMembers]);

  const filteredMembers = useMemo(() => {
    let r = allMembers;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter((m) => [m.name, m.email, m.slot_no, m.slot_sponsor_no].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)));
    }
    if (filters.membership_id) r = r.filter((m) => String(m.membership_id ?? "") === filters.membership_id);
    if (filters.type) r = r.filter((m) => filters.type === "placed" ? !!m.slot_placement_no : !m.slot_placement_no);
    if (filters.kyc_status) r = r.filter((m) => String(m.slot_status) === filters.kyc_status);
    return r;
  }, [allMembers, search, filters]);

  const total = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pagedMembers = useMemo(() => filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredMembers, page]);

  useEffect(() => { setPage(1); }, [search, filters]);

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setSearch(searchInput); }

  function initDetailTabFilters(id: number) {
    const base = { id };
    setDetailFilters({ earnings: { ...base, type: "all", from: null, to: null, search: null }, distributed: { ...base, type: "all", from: null, to: null, search: null }, wallet: { ...base, from: null, to: null }, payout: { ...base, from: null, to: null }, points: { ...base, type: "all", from: null, to: null }, network: { ...base, level: "all", search: null, type: "placement" }, codevault: { ...base, status: null, search: null } });
  }

  function openDetail(slot: SlotData) {
    setSelectedSlot(slot);
    setDetailOpen(true);
    setDetailTab("info");
    setSlotInfo(null); setSlotDetails(null); setSlotEarnings(null); setSlotDistributed(null);
    setSlotWallet(null); setSlotPayout(null); setSlotPoints(null); setSlotNetwork(null); setSlotCodevault(null);
    initDetailTabFilters(slot.slot_id);
    apiPost<any>("/api/member/get_slot_information", { id: slot.slot_id }, token).then((r) => {
      setSlotInfo(r);
      setAdjustId(String(r?.slot_id ?? slot.slot_id));
      setAdjustCode(r?.slot_no ?? slot.slot_no);
    }).catch(() => setSlotInfo({}));
  }

  async function loadDetailTab(tab: string) {
    if (!selectedSlot) return;
    const tabKey = tab as DetailTab;
    setDetailTab(tabKey);
    if (tabKey === "info") return;
    const sid = selectedSlot.slot_id;
    const df = detailFilters;
    try {
      switch (tabKey) {
        case "details": {
          const d = await apiPost<any>("/api/member/get_slot_details", { id: sid }, token);
          setSlotDetails(d); break;
        }
        case "earnings": {
          const d = await apiPost<any>("/api/member/get_slot_earnings", df.earnings ?? { id: sid }, token);
          setSlotEarnings(d); break;
        }
        case "distributed": {
          const d = await apiPost<any>("/api/member/get_slot_distributed", df.distributed ?? { id: sid }, token);
          setSlotDistributed(d); break;
        }
        case "wallet": {
          const d = await apiPost<any>("/api/member/get_slot_wallet", df.wallet ?? { id: sid }, token);
          setSlotWallet(d); break;
        }
        case "payout": {
          const d = await apiPost<any>("/api/member/get_slot_payout", df.payout ?? { id: sid }, token);
          setSlotPayout(d); break;
        }
        case "points": {
          const d = await apiPost<any>("/api/member/get_slot_points", df.points ?? { id: sid }, token);
          setSlotPoints(d); break;
        }
        case "network": {
          const d = await apiPost<any>("/api/member/get_slot_network", df.network ?? { id: sid }, token);
          setSlotNetwork(d); break;
        }
        case "codevault": {
          const d = await apiPost<any>("/api/member/get_slot_codevault", df.codevault ?? { id: sid }, token);
          setSlotCodevault(d); break;
        }
      }
    } catch (err) { console.error(`Failed to load ${tab}:`, err); }
  }

  async function slotSubmitTabInfo() {
    if (!token || !slotInfo?.information) return;
    setSubmitting(true);
    try {
      await apiPost("/api/member/submit_slot_information", { ...slotInfo.information, user }, token);
      toast.success("Slot information updated");
      loadMembers();
    } catch (err: any) {
      if (err?.status_message) toast.error(err.status_message);
      else toast.error("Failed to update");
    }
    setSubmitting(false);
  }

  async function handleVerify(slotId: number, status: "verified" | "rejected") {
    if (!token) return;
    try {
      await apiPost("/api/member/user_verification", { id: slotId, status }, token);
      toast.success(`Member ${status}`);
      loadMembers();
      setDetailOpen(false);
    } catch (err) { toast.error("Verification failed"); }
  }

  async function handleAddMember() {
    if (!token) return;
    setAddLoading(true);
    try {
      const res: any = await apiPost("/api/member/add_member", { first_name: addForm.first_name, last_name: addForm.last_name, middle_name: addForm.middle_name, email: addForm.email, contact: addForm.contact, username: addForm.username, password: addForm.password, slot_referral: addForm.sponsor, register_platform: "system", country_id: addForm.country_id || 1, slot_link: "referral", user }, token);
      toast.success("Member added successfully");
      setAddOpen(false);
      setAddForm(EMPTY_ADD);
      loadMembers();
      if (res?.status_data_name && res?.status_data_id) {
        setCreateSlotSearch(res.status_data_name);
        setCreateSlotForm((f) => ({ ...f, slot_owner: res.status_data_id }));
      }
      setCreateSlotOpen(true);
    } catch (err: any) {
      if (err?.errors) { Object.values(err.errors as Record<string, string[]>).flat().forEach((m) => toast.error(m)); }
      else { toast.error(err instanceof Error ? err.message : "Failed to add member"); }
    }
    setAddLoading(false);
  }

  async function handleCreateSlot() {
    if (!token) return;
    setCreateSlotLoading(true);
    try {
      const res: any = await apiPost("/api/member/add_slot", { ...createSlotForm, from_admin: 1, user }, token);
      toast.success("Slot created successfully");
      setCreateSlotOpen(false);
      setCreateSlotForm(EMPTY_CREATE_SLOT);
      setCreateSlotSearch("");
      loadMembers();
      if (res?.status_data_id) {
        setPlaceSlotForm((f) => ({ ...f, slot_code: res.status_data_id }));
        setPlaceSlotOpen(true);
      }
    } catch (err: any) {
      if (err?.status_message) toast.error(err.status_message);
      else toast.error("Failed to create slot");
    }
    setCreateSlotLoading(false);
  }

  async function getRandomCode() {
    if (!token) return;
    try {
      const res: any = await apiPost("/api/admin/get_random_code", { user_id: user?.id }, token);
      if (res) {
        setCreateSlotForm((f) => ({ ...f, code: res.code_activation || "", pin: res.code_pin || "" }));
      }
    } catch { toast.error("Failed to get code"); }
  }

  async function ownerSearch(q: string) {
    setCreateSlotSearch(q);
    if (!token) return;
    try {
      const res = await apiPost<any[]>("/api/member/slot_info", { name: q }, token);
      setMemberSearchList(Array.isArray(res) ? res : []);
    } catch { setMemberSearchList([]); }
  }

  function selectOwner(name: string, id: number) {
    setCreateSlotSearch(name);
    apiPost("/api/member/select_users", { id }, token).then((r: any) => {
      setCreateSlotForm((f) => ({ ...f, slot_owner: r ?? id }));
    }).catch(() => {});
  }

  function selectSlotOwnerInfo(name: string, id: number) {
    if (!slotInfo) return;
    setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, slot_owner: id, name } } : prev);
    apiPost("/api/member/select_users", { id }, token).then((r: any) => {
      setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, slot_owner: r ?? id } } : prev);
    }).catch(() => {});
  }

  async function infoSlotSearch(q: string) {
    if (!token) return;
    try {
      const res = await apiPost<any[]>("/api/member/slot_info", { name: q }, token);
      setInfoSlotList(Array.isArray(res) ? res : []);
    } catch { setInfoSlotList([]); }
  }

  async function handlePlaceSlot() {
    if (!token) return;
    setPlaceSlotLoading(true);
    try {
      await apiPost("/api/member/place_slot", { ...placeSlotForm, user }, token);
      toast.success("Slot placed successfully");
      setPlaceSlotOpen(false);
      setPlaceSlotForm(EMPTY_PLACE_SLOT);
      setPlaceSlotSearch("");
      loadMembers();
    } catch (err: any) {
      if (err?.status_message) toast.error(err.status_message);
      else toast.error("Failed to place slot");
    }
    setPlaceSlotLoading(false);
  }

  async function autoPosition() {
    if (!token) return;
    try {
      const res: any = await apiPost("/api/member/get_auto_position", { user: user?.id }, token);
      if (res) {
        setPlaceSlotForm((f) => ({ ...f, slot_placement: res.slot_no || "", slot_position: res.position || "LEFT" }));
      }
    } catch { toast.error("Auto position failed"); }
  }

  async function placeOwnerSearch(q: string) {
    setPlaceSlotSearch(q);
    if (!token) return;
    try {
      const res = await apiPost<any[]>("/api/slot/get_unplaced", { name: q }, token);
      setUnplacedSlotList(Array.isArray(res) ? res : []);
    } catch { setUnplacedSlotList([]); }
  }

  function selectPlaceOwner(slotNo: string) {
    setPlaceSlotSearch(slotNo);
    apiPost("/api/member/get_unplaced", { slot_code: slotNo }, token).then((r: any) => {
      setPlaceSlotForm((f) => ({ ...f, slot_code: r ?? slotNo }));
    }).catch(() => {});
  }

  async function limitSearch(q: string) {
    setSlotLimitSearch(q);
    if (!token) return;
    try {
      const res = await apiPost<any[]>("/api/member/slot_info", { name: q }, token);
      setMemberLimitList(Array.isArray(res) ? res : []);
      if (q.length === 0) slotLimitLoad(0);
      else if (res?.[0]?.id) slotLimitLoad(res[0].id);
    } catch { setMemberLimitList([]); }
  }

  function selectLimitOwner(name: string, id: number) {
    setSlotLimitSearch(name);
    if (id !== 0) {
      apiPost("/api/member/select_users", { id }, token).then((r: any) => slotLimitLoad(r ?? id)).catch(() => {});
    }
  }

  async function slotLimitLoad(id: number) {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/member/slot_limit", { id }, token);
      setSlotLimitData(res);
    } catch {}
  }

  async function handleSlotLimit() {
    if (!token) return;
    setSlotLimitLoading(true);
    try {
      await apiPost("/api/member/update_slot_limit", { ...slotLimitData, update_all: slotLimitForm.all_member ? 1 : 0, user, slot_limit: slotLimitForm.slot_limit }, token);
      toast.success("Slot limit updated");
      setSlotLimitOpen(false);
    } catch { toast.error("Failed to update slot limit"); }
    setSlotLimitLoading(false);
  }

  async function handleResetData() {
    if (!token) return;
    setResetLoading(true);
    try {
      await apiPost("/api/admin/reset_data", { ...resetForm, user: user }, token);
      toast.success("Data reset successful");
      setResetOpen(false);
      setResetForm(EMPTY_RESET);
      window.location.reload();
    } catch { toast.error("Reset failed"); }
    setResetLoading(false);
  }

  async function getHistorySlotCodeChanges() {
    if (!token || !selectedSlot) return;
    try {
      const res = await apiPost<any>("/api/member/slot_code_history", { id: selectedSlot.slot_id }, token);
      setSlotCodeHistory(res);
      setHistoryOpen(true);
    } catch { toast.error("Failed to load history"); }
  }

  async function handleAdjustWallet() {
    if (!token) return;
    setAdjustLoading(true);
    try {
      await apiPost("/api/member/adjust_wallet", { slot_id: adjustId, trigger: adjustTrigger, plan: adjustPlan, amount: adjustAmount, currency_id: adjustCurrencyId, user }, token);
      toast.success("Wallet adjusted");
      setAdjustOpen(false);
      setAdjustAmount("0");
      loadMembers();
    } catch { toast.error("Failed to adjust wallet"); }
    setAdjustLoading(false);
  }

  function hiddenPassClick() {
    const pwd = prompt("Please enter password", "*********");
    if (pwd === null || pwd === "") toast.warning("Cancelled");
    else if (pwd === "error0101") setHiddenPass((h) => !h);
    else toast.error("Wrong Password");
  }

  const currencies = Array.isArray(currencyList) ? currencyList : currencyList?.currency_lists ?? [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Member List</h1>
          <p className="text-muted-foreground">
            Manage member information and there{" "}
            <button onClick={hiddenPassClick} className="underline text-primary cursor-pointer">slot</button>
            {" "}({total} total)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => { setPlaceSlotForm(EMPTY_PLACE_SLOT); setPlaceSlotOpen(true); }}>
            <Dot className="h-4 w-4 mr-1" /> Place Slot
          </Button>
          <Button variant="outline" onClick={() => { setCreateSlotForm(EMPTY_CREATE_SLOT); setCreateSlotOpen(true); }}>
            <Dot className="h-4 w-4 mr-1" /> Create Slot
          </Button>
          <Button variant="outline" onClick={() => { setSlotLimitForm(EMPTY_SLOT_LIMIT); setSlotLimitOpen(true); slotLimitLoad(0); }}>
            <Ban className="h-4 w-4 mr-1" /> Slot Limit/Member
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> Add Member
          </Button>
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RefreshCw className="h-4 w-4 mr-1" /> Reset
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
                <Input placeholder="Search name or slot..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-10" />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <Select value={filters.membership_id} onValueChange={(v) => setFilters((f) => ({ ...f, membership_id: v === "all" ? "" : v }))}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Membership" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Membership</SelectItem>
                {membershipOptions.map((m) => (<SelectItem key={m.membership_id} value={String(m.membership_id)}>{m.membership_name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v === "all" ? "" : v }))}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Type</SelectItem>
                <SelectItem value="placed">Paid Slot</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.kyc_status} onValueChange={(v) => setFilters((f) => ({ ...f, kyc_status: v === "all" ? "" : v }))}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="KYC Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="1">Verified</SelectItem>
                <SelectItem value="3">Rejected</SelectItem>
                <SelectItem value="2">For Approval</SelectItem>
                <SelectItem value="0">No Valid ID</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadMembers}><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Members table */}
      <MembersTable loading={loading} members={pagedMembers} page={page} totalPages={totalPages} onPageChange={setPage} onView={openDetail} />

      {/* Slot Information modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Slot Information — {selectedSlot?.name}</DialogTitle>
          </DialogHeader>
          {slotInfo && (
            <Tabs value={detailTab} onValueChange={loadDetailTab}>
              <TabsList className="flex flex-wrap w-full gap-1">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="earnings">Earning History</TabsTrigger>
                <TabsTrigger value="distributed">Distributed Income</TabsTrigger>
                <TabsTrigger value="wallet">Wallet History</TabsTrigger>
                <TabsTrigger value="payout">Payout History</TabsTrigger>
                <TabsTrigger value="points">Points History</TabsTrigger>
                <TabsTrigger value="network">Network List</TabsTrigger>
                <TabsTrigger value="codevault">Codevault</TabsTrigger>
              </TabsList>

              {/* Information tab */}
              <TabsContent value="info" className="mt-4 space-y-4">
                <div className="text-sm font-semibold text-muted-foreground border-b pb-2">Slot Information</div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Username</Label>
                    <div className="flex gap-1">
                      <Input size={1} value={slotInfo?.information?.slot_no ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, slot_no: e.target.value } } : prev)} />
                      <Button variant="outline" size="icon" onClick={getHistorySlotCodeChanges} title="Username History"><History className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="space-y-1 relative">
                    <Label className="text-xs">Slot Owner</Label>
                    <Input size={1} value={slotInfo?.information?.name ?? ""} onChange={(e) => infoSlotSearch(e.target.value)} placeholder="Enter Owner Name" />
                    {infoSlotList.length > 0 && (
                      <div className="absolute z-10 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 max-h-[200px] overflow-y-auto">
                        {infoSlotList.map((item: any) => (
                          <button key={item.id} type="button" className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent" onClick={() => { selectSlotOwnerInfo(item.name, item.id); setInfoSlotList([]); }}>{item.name} ({item.email})</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Sponsor</Label>
                    <Input size={1} value={slotInfo?.information?.slot_sponsor_code ?? ""} disabled />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Membership</Label>
                    <Select value={String(slotInfo?.information?.slot_membership ?? "")} onValueChange={(v) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, slot_membership: v } } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {membershipOptions.map((m) => (<SelectItem key={m.membership_id} value={String(m.membership_id)}>{m.membership_name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Slot Status</Label>
                    <Select value={slotInfo?.information?.slot_status ?? "active"} onValueChange={(v) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, slot_status: v } } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="blocked">Blocked</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Email Status</Label>
                    <Select value={String(slotInfo?.information?.email_verified ?? "1")} onValueChange={(v) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, email_verified: v } } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="1">Activated</SelectItem><SelectItem value="0">Inactive</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">KYC Status</Label>
                    <Select value={String(slotInfo?.information?.verified ?? "0")} onValueChange={(v) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, verified: Number(v) } } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Valid ID</SelectItem>
                        <SelectItem value="1">Verified</SelectItem>
                        <SelectItem value="3">Rejected</SelectItem>
                        <SelectItem value="2">For Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Store Name</Label>
                    <Input size={1} value={slotInfo?.information?.store_name ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, store_name: e.target.value } } : prev)} placeholder="Ex. Iqon Elite Corp's Store" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Placement Username</Label>
                    <Input size={1} value={slotInfo?.information?.slot_placement_code ?? ""} disabled />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Position</Label>
                    <Select value={slotInfo?.information?.slot_position ?? "LEFT"} onValueChange={(v) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, slot_position: v } } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="LEFT">Left</SelectItem><SelectItem value="RIGHT">Right</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-sm font-semibold text-muted-foreground border-b pb-2">Member Information</div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">First Name</Label>
                    <Input size={1} value={slotInfo?.information?.first_name ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, first_name: e.target.value } } : prev)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Middle Name</Label>
                    <Input size={1} value={slotInfo?.information?.middle_name ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, middle_name: e.target.value } } : prev)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Last Name</Label>
                    <Input size={1} value={slotInfo?.information?.last_name ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, last_name: e.target.value } } : prev)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">E-Mail</Label>
                    <Input size={1} value={slotInfo?.information?.email ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, email: e.target.value } } : prev)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Contact Number</Label>
                    <Input size={1} value={slotInfo?.information?.contact ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, contact: e.target.value } } : prev)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Country / Currency</Label>
                    <Select value={String(slotInfo?.information?.country_id ?? "")} onValueChange={(v) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, country_id: Number(v) } } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {countryList.map((c: any) => (<SelectItem key={c.country_id} value={String(c.country_id)}>{c.country_name} ({c.currency_code})</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(slotInfo?.information?.id === 1 ? !hiddenPass : true) && (
                    <div className="space-y-1">
                      <Label className="text-xs">Password</Label>
                      <Input size={1} value={slotInfo?.information?.show_password ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, show_password: e.target.value } } : prev)} />
                    </div>
                  )}
                </div>

                <div className="text-sm font-semibold text-muted-foreground border-b pb-2">Beneficiary Information</div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Beneficiary First Name</Label>
                    <Input size={1} value={slotInfo?.information?.beneficiary_first_name ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, beneficiary_first_name: e.target.value } } : prev)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Beneficiary Middle Name</Label>
                    <Input size={1} value={slotInfo?.information?.beneficiary_middle_name ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, beneficiary_middle_name: e.target.value } } : prev)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Beneficiary Last Name</Label>
                    <Input size={1} value={slotInfo?.information?.beneficiary_last_name ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, beneficiary_last_name: e.target.value } } : prev)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Beneficiary Contact</Label>
                    <Input size={1} value={slotInfo?.information?.beneficiary_contact ?? ""} onChange={(e) => setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, beneficiary_contact: e.target.value } } : prev)} />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setDetailOpen(false)}>Cancel</Button>
                  <Button onClick={slotSubmitTabInfo} disabled={submitting}>
                    <Save className="h-4 w-4 mr-1" /> {submitting ? "Saving..." : "Update Slot Information"}
                  </Button>
                </div>
              </TabsContent>

              {/* Details tab */}
              <TabsContent value="details" className="mt-4 space-y-4">
                {!slotDetails ? <LoadingSpinner /> : (
                  <>
                    <div className="text-sm font-semibold text-muted-foreground border-b pb-2">Slot Details</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FieldRow label="Slot ID">{slotDetails.slot_id}</FieldRow>
                        <FieldRow label="Username">{slotDetails.slot_no}</FieldRow>
                        <FieldRow label="Slot Owner"><a href="javascript:void(0)" className="text-primary">{slotDetails.first_name} {slotDetails.last_name}</a></FieldRow>
                        <FieldRow label="Cashin Wallet">{Number(slotDetails.cashin_wallet?.wallet_amount ?? 0).toFixed(2)}</FieldRow>
                        <FieldRow label="Current Wallet">{Number(slotDetails.slot_wallet?.wallet_amount ?? 0).toFixed(2)}</FieldRow>
                        <FieldRow label="Total Earnings">{Number(slotDetails.slot_earning ?? 0).toFixed(2)}</FieldRow>
                        <FieldRow label="Total Payout">0.00</FieldRow>
                        <FieldRow label="Sponsor Tree"><a href="javascript:void(0)" className="text-primary">{slotDetails.slot_downline_sponsor ?? 0} DOWNLINES</a></FieldRow>
                        <FieldRow label="Binary Tree"><a href="javascript:void(0)" className="text-primary">{slotDetails.slot_downline_placement ?? 0} DOWNLINES</a></FieldRow>
                        <FieldRow label="Code Vault (Membership)"><a href="javascript:void(0)" className="text-primary">{slotDetails.membership_code ?? 0} Codes</a></FieldRow>
                        <FieldRow label="Code Vault (Product)"><a href="javascript:void(0)" className="text-primary">{slotDetails.product_code ?? 0} Codes</a></FieldRow>
                      </div>
                      <div className="space-y-2">
                        <FieldRow label="Sponsor">{slotDetails.sponsor ? <a href="javascript:void(0)" className="text-primary">{slotDetails.sponsor.slot_no}</a> : "No Sponsor"}</FieldRow>
                        <FieldRow label="Placement">{slotDetails.placement ? <a href="javascript:void(0)" className="text-primary">{slotDetails.placement.slot_no}</a> : "No Placement"}</FieldRow>
                        <FieldRow label="Position">{slotDetails.slot_position}</FieldRow>
                        <FieldRow label="Membership">{slotDetails.membership_name}</FieldRow>
                        <FieldRow label="Type">{Number(slotDetails.slot_owner) === 1 ? "Company Slot" : "Member Slot"}</FieldRow>
                        <FieldRow label="Code Source">{slotDetails.code_source ? `${slotDetails.code_source.code_activation} + ${slotDetails.code_source.code_pin}` : "00000 + 00000"}</FieldRow>
                        <FieldRow label="Slot Creation Timestamp">{formatDateTime(slotDetails.slot_date_created)}</FieldRow>
                        <FieldRow label="Slot Placement Timestamp">{slotDetails.slot_date_placed ? formatDateTime(slotDetails.slot_date_placed) : "Unknown"}</FieldRow>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-muted-foreground border-b pb-2">Member Details</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FieldRow label="First Name">{slotDetails.first_name}</FieldRow>
                        <FieldRow label="Last Name">{slotDetails.last_name}</FieldRow>
                        <FieldRow label="E-Mail">{slotDetails.email}</FieldRow>
                      </div>
                      <div className="space-y-2">
                        <FieldRow label="Slots Owned"><a href="javascript:void(0)" className="text-primary">{slotDetails.slot_count ?? 0} SLOT(S)</a></FieldRow>
                        <FieldRow label="Contact Number">{slotDetails.contact}</FieldRow>
                        <FieldRow label="Country / Currency">{slotDetails.country_name} ({slotDetails.currency_code})</FieldRow>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-muted-foreground border-b pb-2">Member's Valid ID</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted text-center text-xs font-medium py-2">FRONT ID</div>
                        <div className="p-2 flex items-center justify-center min-h-[150px]">
                          {slotDetails.front_id ? <img src={slotDetails.front_id} alt="Front ID" className="max-h-[200px] object-contain" /> : <span className="text-muted-foreground text-sm">No image</span>}
                        </div>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted text-center text-xs font-medium py-2">BACK ID</div>
                        <div className="p-2 flex items-center justify-center min-h-[150px]">
                          {slotDetails.back_id ? <img src={slotDetails.back_id} alt="Back ID" className="max-h-[200px] object-contain" /> : <span className="text-muted-foreground text-sm">No image</span>}
                        </div>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted text-center text-xs font-medium py-2">SELFIE WITH ID</div>
                        <div className="p-2 flex items-center justify-center min-h-[150px]">
                          {slotDetails.selfie_id ? <img src={slotDetails.selfie_id} alt="Selfie with ID" className="max-h-[200px] object-contain" /> : <span className="text-muted-foreground text-sm">No image</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-2 pt-2">
                      {Number(slotDetails.verified) === 1 && <span className="text-green-600 font-medium">Verified User</span>}
                      {Number(slotDetails.verified) === 2 && (
                        <>
                          <Button variant="destructive" onClick={() => handleVerify(selectedSlot!.slot_id, "rejected")}>Set as Rejected</Button>
                          <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleVerify(selectedSlot!.slot_id, "verified")}>Set as Verified</Button>
                        </>
                      )}
                      {Number(slotDetails.verified) === 3 && <span className="text-red-600 font-medium">Rejected</span>}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Earning History tab */}
              <TabsContent value="earnings" className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Select value={detailFilters.earnings?.type ?? "all"} onValueChange={(v) => { setDetailFilters((f) => ({ ...f, earnings: { ...f.earnings, type: v } })); setSlotEarnings(null); loadDetailTab("earnings"); }}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Type</SelectItem><SelectItem value="paid">Paid Slot</SelectItem></SelectContent>
                  </Select>
                  <Input type="date" className="w-[160px]" value={detailFilters.earnings?.from ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, earnings: { ...f.earnings, from: e.target.value } })); setSlotEarnings(null); loadDetailTab("earnings"); }} />
                  <Input type="date" className="w-[160px]" value={detailFilters.earnings?.to ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, earnings: { ...f.earnings, to: e.target.value } })); setSlotEarnings(null); loadDetailTab("earnings"); }} />
                  <Input placeholder="Search Username" className="w-[180px]" value={detailFilters.earnings?.search ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, earnings: { ...f.earnings, search: e.target.value } })); setSlotEarnings(null); loadDetailTab("earnings"); }} />
                </div>
                {!slotEarnings ? <LoadingSpinner /> : (
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
                        {(slotEarnings.data ?? []).length > 0 ? (slotEarnings.data ?? []).map((e: any, i: number) => (
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
                      {slotEarnings.total_earning != null && (
                        <tfoot>
                          <TableRow>
                            <TableHead colSpan={4} className="text-right">Total Earnings</TableHead>
                            <TableHead className="text-right font-bold text-blue-600">{Number(slotEarnings.total_earning).toFixed(2)}</TableHead>
                          </TableRow>
                        </tfoot>
                      )}
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Distributed Income tab */}
              <TabsContent value="distributed" className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Select value={detailFilters.distributed?.type ?? "all"} onValueChange={(v) => { setDetailFilters((f) => ({ ...f, distributed: { ...f.distributed, type: v } })); setSlotDistributed(null); loadDetailTab("distributed"); }}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Type</SelectItem></SelectContent>
                  </Select>
                  <Input type="date" className="w-[160px]" value={detailFilters.distributed?.from ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, distributed: { ...f.distributed, from: e.target.value } })); setSlotDistributed(null); loadDetailTab("distributed"); }} />
                  <Input type="date" className="w-[160px]" value={detailFilters.distributed?.to ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, distributed: { ...f.distributed, to: e.target.value } })); setSlotDistributed(null); loadDetailTab("distributed"); }} />
                  <Input placeholder="Search Username" className="w-[180px]" value={detailFilters.distributed?.search ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, distributed: { ...f.distributed, search: e.target.value } })); setSlotDistributed(null); loadDetailTab("distributed"); }} />
                </div>
                {!slotDistributed ? <LoadingSpinner /> : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Slot Event</TableHead>
                          <TableHead>Earning Recipient</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(slotDistributed.data ?? []).length > 0 ? (slotDistributed.data ?? []).map((d: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{formatDate(d.earning_log_date_created)}</TableCell>
                            <TableCell>{d.earning_log_date_created ? new Date(d.earning_log_date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</TableCell>
                            <TableCell>{d.earning_log_entry_type}</TableCell>
                            <TableCell>{d.tbl_slot_owner}</TableCell>
                            <TableCell>{d.earning_log_plan_type}</TableCell>
                            <TableCell className="text-right font-medium">{Number(d.earning_log_amount ?? 0).toFixed(2)}</TableCell>
                          </TableRow>
                        )) : (
                          <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No distributed income found</TableCell></TableRow>
                        )}
                      </TableBody>
                      {slotDistributed.total_distributed != null && (
                        <tfoot>
                          <TableRow>
                            <TableHead colSpan={5} className="text-right">Total Distributed Income</TableHead>
                            <TableHead className="text-right font-bold text-blue-600">{Number(slotDistributed.total_distributed).toFixed(2)}</TableHead>
                          </TableRow>
                        </tfoot>
                      )}
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Wallet History tab */}
              <TabsContent value="wallet" className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <Input type="date" className="w-[160px]" value={detailFilters.wallet?.from ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, wallet: { ...f.wallet, from: e.target.value } })); setSlotWallet(null); loadDetailTab("wallet"); }} />
                  <Input type="date" className="w-[160px]" value={detailFilters.wallet?.to ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, wallet: { ...f.wallet, to: e.target.value } })); setSlotWallet(null); loadDetailTab("wallet"); }} />
                  <div className="flex-1" />
                  <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1" /> Export as PDF</Button>
                  <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export as CSV</Button>
                  <Button size="sm" onClick={() => { setAdjustId(String(selectedSlot?.slot_id ?? "")); setAdjustCode(selectedSlot?.slot_no ?? ""); setAdjustOpen(true); }}><Wallet className="h-3 w-3 mr-1" /> Adjust Wallet</Button>
                </div>
                {!slotWallet ? <LoadingSpinner /> : (
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
                        {(slotWallet.data ?? []).length > 0 ? (slotWallet.data ?? []).map((w: any, i: number) => (
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
                      {slotWallet.total_wallet != null && (
                        <tfoot>
                          <TableRow>
                            <TableHead colSpan={4} className="text-right">Current Balance</TableHead>
                            <TableHead className="text-right font-bold text-blue-600">{Number(slotWallet.total_wallet).toFixed(2)}</TableHead>
                          </TableRow>
                        </tfoot>
                      )}
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Payout History tab */}
              <TabsContent value="payout" className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <Input type="date" className="w-[160px]" value={detailFilters.payout?.from ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, payout: { ...f.payout, from: e.target.value } })); setSlotPayout(null); loadDetailTab("payout"); }} />
                  <Input type="date" className="w-[160px]" value={detailFilters.payout?.to ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, payout: { ...f.payout, to: e.target.value } })); setSlotPayout(null); loadDetailTab("payout"); }} />
                  <div className="flex-1" />
                  <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1" /> Export as PDF</Button>
                  <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export as CSV</Button>
                </div>
                {!slotPayout ? <LoadingSpinner /> : (
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
                        {(slotPayout.data ?? []).length > 0 ? (slotPayout.data ?? []).map((p: any, i: number) => (
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
                      {slotPayout.total_payout != null && (
                        <tfoot>
                          <TableRow>
                            <TableHead colSpan={5} className="text-right">Total Deposit</TableHead>
                            <TableHead className="text-right font-bold text-red-600">{Number(slotPayout.total_payout).toFixed(2)}</TableHead>
                          </TableRow>
                        </tfoot>
                      )}
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Points History tab */}
              <TabsContent value="points" className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Select value={detailFilters.points?.type ?? "all"} onValueChange={(v) => { setDetailFilters((f) => ({ ...f, points: { ...f.points, type: v } })); setSlotPoints(null); loadDetailTab("points"); }}>
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
                  <Input type="date" className="w-[160px]" value={detailFilters.points?.from ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, points: { ...f.points, from: e.target.value } })); setSlotPoints(null); loadDetailTab("points"); }} />
                  <Input type="date" className="w-[160px]" value={detailFilters.points?.to ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, points: { ...f.points, to: e.target.value } })); setSlotPoints(null); loadDetailTab("points"); }} />
                </div>
                {!slotPoints ? <LoadingSpinner /> : (
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
                        {(slotPoints.data ?? []).length > 0 ? (slotPoints.data ?? []).map((p: any, i: number) => (
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

              {/* Network List tab */}
              <TabsContent value="network" className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <Select value={detailFilters.network?.level ?? "all"} onValueChange={(v) => { setDetailFilters((f) => ({ ...f, network: { ...f.network, level: v } })); setSlotNetwork(null); loadDetailTab("network"); }}>
                    <SelectTrigger className="w-[80px]"><SelectValue placeholder="Level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {Array.from({ length: 11 }, (_, i) => i + 1).map((n) => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={detailFilters.network?.type ?? "placement"} onValueChange={(v) => { setDetailFilters((f) => ({ ...f, network: { ...f.network, type: v } })); setSlotNetwork(null); loadDetailTab("network"); }}>
                    <SelectTrigger className="w-[130px]"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent><SelectItem value="placement">Binary</SelectItem><SelectItem value="sponsor">Unilevel</SelectItem></SelectContent>
                  </Select>
                  <Input placeholder="Search Username or name" className="w-[200px]" value={detailFilters.network?.search ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, network: { ...f.network, search: e.target.value } })); setSlotNetwork(null); loadDetailTab("network"); }} />
                  <div className="flex-1" />
                  <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1" /> Export Item Breakdown</Button>
                  <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1" /> Export as PDF</Button>
                  <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export as CSV</Button>
                </div>
                {!slotNetwork ? <LoadingSpinner /> : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Level</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Slot Owner</TableHead>
                          <TableHead>Timestamp Created</TableHead>
                          {detailFilters.network?.type === "placement" && <TableHead>Timestamp Placed</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(slotNetwork.data ?? []).length > 0 ? (slotNetwork.data ?? []).map((n: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{detailFilters.network?.type === "placement" ? n.placement_level : n.sponsor_level}</TableCell>
                            <TableCell><a href="javascript:void(0)" className="text-primary">{n.slot_no}</a></TableCell>
                            <TableCell><a href="javascript:void(0)" className="text-primary">{n.first_name} {n.last_name}</a></TableCell>
                            <TableCell>{formatDateTime(n.slot_date_created)}</TableCell>
                            {detailFilters.network?.type === "placement" && (
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

              {/* Codevault tab */}
              <TabsContent value="codevault" className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <Select value={detailFilters.codevault?.status ?? "all"} onValueChange={(v) => { setDetailFilters((f) => ({ ...f, codevault: { ...f.codevault, status: v === "all" ? null : v } })); setSlotCodevault(null); loadDetailTab("codevault"); }}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Status</SelectItem></SelectContent>
                  </Select>
                  <Input placeholder="Search code or pin" className="w-[200px]" value={detailFilters.codevault?.search ?? ""} onChange={(e) => { setDetailFilters((f) => ({ ...f, codevault: { ...f.codevault, search: e.target.value } })); setSlotCodevault(null); loadDetailTab("codevault"); }} />
                  <div className="flex-1" />
                  <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1" /> Export as PDF</Button>
                  <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> Export as CSV</Button>
                </div>
                {!slotCodevault ? <LoadingSpinner /> : (
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
                        {(slotCodevault.data ?? []).length > 0 ? (slotCodevault.data ?? []).map((c: any, i: number) => (
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
            </Tabs>
          )}
          {!slotInfo && <LoadingSpinner />}
        </DialogContent>
      </Dialog>

      {/* Add Member modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle><UserPlus className="h-4 w-4 inline mr-1" /> Add New Member</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Sponsor Username</Label>
              <Input value={addForm.sponsor} onChange={(e) => setAddForm((f) => ({ ...f, sponsor: e.target.value }))} placeholder="Sponsor Username" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Username</Label>
              <Input value={addForm.username} onChange={(e) => setAddForm((f) => ({ ...f, username: e.target.value }))} placeholder="Enter username" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} placeholder="Enter email" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">First Name</Label>
              <Input value={addForm.first_name} onChange={(e) => setAddForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="First Name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Middle Name</Label>
              <Input value={addForm.middle_name} onChange={(e) => setAddForm((f) => ({ ...f, middle_name: e.target.value }))} placeholder="Middle Name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Last Name</Label>
              <Input value={addForm.last_name} onChange={(e) => setAddForm((f) => ({ ...f, last_name: e.target.value }))} placeholder="Last Name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Contact Number</Label>
              <Input value={addForm.contact} onChange={(e) => setAddForm((f) => ({ ...f, contact: e.target.value }))} placeholder="Contact Number" maxLength={11} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Country / Currency</Label>
              <Select value={addForm.country_id} onValueChange={(v) => setAddForm((f) => ({ ...f, country_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {countryList.map((c: any) => (<SelectItem key={c.country_id} value={String(c.country_id)}>{c.country_name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Password</Label>
              <Input type="text" value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} placeholder="Password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Close</Button>
            <Button onClick={handleAddMember} disabled={addLoading}>{addLoading ? "Saving..." : "Save New Member"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Slot modal */}
      <Dialog open={createSlotOpen} onOpenChange={setCreateSlotOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle><Dot className="h-4 w-4 inline mr-1" /> Create Slot</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Code</Label>
              <Input value={createSlotForm.code} onChange={(e) => setCreateSlotForm((f) => ({ ...f, code: e.target.value }))} placeholder="Enter Code" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pin</Label>
              <Input value={createSlotForm.pin} onChange={(e) => setCreateSlotForm((f) => ({ ...f, pin: e.target.value }))} placeholder="Enter Pin" />
            </div>
            <div className="space-y-1 relative">
              <Label className="text-xs">Slot Owner</Label>
              <Input value={createSlotSearch} onChange={(e) => ownerSearch(e.target.value)} placeholder="Enter Owner Name" />
              {memberSearchList.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 max-h-[200px] overflow-y-auto">
                  {memberSearchList.map((item: any) => (
                    <button key={item.id} type="button" className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent" onClick={() => { selectOwner(item.name, item.id); setMemberSearchList([]); }}>{item.name} ({item.email})</button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sponsor</Label>
              <Input value={createSlotForm.slot_sponsor} onChange={(e) => setCreateSlotForm((f) => ({ ...f, slot_sponsor: e.target.value }))} placeholder="Sponsor (Username)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateSlotOpen(false)}>Close</Button>
            <Button variant="secondary" onClick={getRandomCode}><QrCode className="h-4 w-4 mr-1" /> Get Code</Button>
            <Button onClick={handleCreateSlot} disabled={createSlotLoading}>{createSlotLoading ? "Creating..." : "Create Slot"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Place Slot modal */}
      <Dialog open={placeSlotOpen} onOpenChange={setPlaceSlotOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle><Dot className="h-4 w-4 inline mr-1" /> Place Slot</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1 relative">
              <Label className="text-xs">Username</Label>
              <Input value={placeSlotSearch} onChange={(e) => placeOwnerSearch(e.target.value)} placeholder="Enter Owner Username" />
              {unplacedSlotList.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 max-h-[200px] overflow-y-auto">
                  {unplacedSlotList.map((item: any) => (
                    <button key={item.slot_no} type="button" className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent" onClick={() => { selectPlaceOwner(item.slot_no); setUnplacedSlotList([]); }}>{item.slot_no} ({item.first_name} {item.last_name})</button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Placement</Label>
              <Input value={placeSlotForm.slot_placement} onChange={(e) => setPlaceSlotForm((f) => ({ ...f, slot_placement: e.target.value }))} placeholder="Placement" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Position</Label>
              <Select value={placeSlotForm.slot_position} onValueChange={(v) => setPlaceSlotForm((f) => ({ ...f, slot_position: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="LEFT">Left</SelectItem><SelectItem value="RIGHT">Right</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlaceSlotOpen(false)}>Close</Button>
            <Button variant="secondary" onClick={autoPosition}><Rocket className="h-4 w-4 mr-1" /> Auto Position</Button>
            <Button onClick={handlePlaceSlot} disabled={placeSlotLoading}>{placeSlotLoading ? "Placing..." : "Place Slot"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slot Limit modal */}
      <Dialog open={slotLimitOpen} onOpenChange={setSlotLimitOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle><Ban className="h-4 w-4 inline mr-1" /> Slots Limit</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Update All Slot</Label>
              <div className="flex items-center gap-2">
                <Checkbox checked={slotLimitForm.all_member} onCheckedChange={(v) => setSlotLimitForm((f) => ({ ...f, all_member: v === true }))} id="updateAll" />
                <Label htmlFor="updateAll" className="text-sm cursor-pointer">Update All Slot</Label>
              </div>
            </div>
            <div className="space-y-1 relative">
              <Label className="text-xs">Slot Owner</Label>
              <Input value={slotLimitSearch} onChange={(e) => limitSearch(e.target.value)} placeholder="Enter Owner Name" />
              {memberLimitList.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 max-h-[200px] overflow-y-auto">
                  {memberLimitList.map((item: any) => (
                    <button key={item.id} type="button" className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent" onClick={() => { selectLimitOwner(item.name, item.id); setMemberLimitList([]); }}>{item.name} ({item.email})</button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Slot Limit</Label>
              <Input type="number" value={slotLimitForm.slot_limit} onChange={(e) => setSlotLimitForm((f) => ({ ...f, slot_limit: e.target.value }))} placeholder="Slot Limit" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotLimitOpen(false)}>Close</Button>
            <Button onClick={handleSlotLimit} disabled={slotLimitLoading}>{slotLimitLoading ? "Updating..." : "Update"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Data modal */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle><RefreshCw className="h-4 w-4 inline mr-1" /> Reset Data</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Enter Security Key for Reset</Label>
              <Input type="password" value={resetForm.security_key} onChange={(e) => setResetForm((f) => ({ ...f, security_key: e.target.value }))} placeholder="Enter Security Key" />
              <p className="text-xs text-muted-foreground">Only administrator who have the security can use this option</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Choose data you would like to reset</Label>
              <div className="space-y-2 mt-2">
                {(["member_list", "slot_list", "plan_settings", "generated_codes", "product_list"] as const).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox checked={resetForm[key]} onCheckedChange={(v) => setResetForm((f) => ({ ...f, [key]: v === true }))} id={key} />
                    <Label htmlFor={key} className="text-sm cursor-pointer capitalize">{key.replace(/_/g, " ")}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>Close</Button>
            <Button onClick={handleResetData} disabled={resetLoading}><RefreshCw className="h-4 w-4 mr-1" /> {resetLoading ? "Resetting..." : "Reset Slot Information"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Username Changes History modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle><History className="h-4 w-4 inline mr-1" /> Username Changes History</DialogTitle></DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Old Username</TableHead>
                  <TableHead className="text-center">New Username</TableHead>
                  <TableHead className="text-center">Change By</TableHead>
                  <TableHead className="text-center">Date Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(slotCodeHistory?.data ?? []).length > 0 ? (slotCodeHistory.data ?? []).map((h: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="text-center">{h.old_slot_code}</TableCell>
                    <TableCell className="text-center">{h.new_slot_code}</TableCell>
                    <TableCell className="text-center">{h.name}</TableCell>
                    <TableCell className="text-center">{h.date_change}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No history</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Wallet modal */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle><Wallet className="h-4 w-4 inline mr-1" /> Adjust Wallet</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Slot ID</Label>
              <Input value={adjustId} onChange={(e) => setAdjustId(e.target.value)} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Slot No</Label>
              <Input value={adjustCode} onChange={(e) => setAdjustCode(e.target.value)} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Trigger</Label>
              <Input value={adjustTrigger} onChange={(e) => setAdjustTrigger(e.target.value)} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Currency</Label>
              <Select value={adjustCurrencyId} onValueChange={setAdjustCurrencyId}>
                <SelectTrigger className="text-center"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c: any) => (<SelectItem key={c.currency_id} value={String(c.currency_id)}>{c.currency_name} ({c.currency_abbreviation})</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 relative">
              <Label className="text-xs">PLAN</Label>
              <Input value={adjustPlan} onChange={(e) => setAdjustPlan(e.target.value)} placeholder="Enter Plan Name" className="text-center" />
              {planList.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 max-h-[200px] overflow-y-auto">
                  {planList.filter((p: any) => !adjustPlan || p.plan_name?.toLowerCase().includes(adjustPlan.toLowerCase())).map((p: any, i: number) => (
                    <button key={i} type="button" className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent" onClick={() => { setAdjustPlan(p.plan_name); }}>{p.plan_name}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Amount</Label>
              <Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} className="text-center" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>Close</Button>
            <Button onClick={handleAdjustWallet} disabled={adjustLoading}>{adjustLoading ? "Submitting..." : "Submit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
