"use client";

import MembersTable, { MembersTableHandle } from "@/components/admin/member/table";
import { AddMemberModal } from "@/components/admin/member/add-member";
import { CreateSlotModal } from "@/components/admin/member/create-slot";
import { PlaceSlotModal } from "@/components/admin/member/place-slot";
import { SlotLimitModal } from "@/components/admin/member/slot-limit";
import { MemberViewModal } from "@/components/admin/member/view";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RefreshCw, Plus, Ban, Dot } from "lucide-react";

interface SlotData {
  slot_id: number;
  slot_no: string;
  name: string;
  membership_name: string;
  membership_id?: number | string;
  slot_status: string;
  [key: string]: unknown;
}

interface ResetDataForm {
  security_key: string;
  member_list: boolean;
  slot_list: boolean;
  plan_settings: boolean;
  generated_codes: boolean;
  product_list: boolean;
}

const EMPTY_RESET: ResetDataForm = {
  security_key: "",
  member_list: true,
  slot_list: true,
  plan_settings: false,
  generated_codes: false,
  product_list: false,
};

export default function AdminMembersPage() {
  const { token } = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const tableRef = useRef<MembersTableHandle>(null);

  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [membershipOptions, setMembershipOptions] = useState<
    { membership_id: number | string; membership_name: string }[]
  >([]);

  const [planList, setPlanList] = useState<any[]>([]);
  const [countryList, setCountryList] = useState<any[]>([]);
  const [currencyList, setCurrencyList] = useState<any>([]);
  const [defaultCurrencyId, setDefaultCurrencyId] = useState("");

  const [addOpen, setAddOpen] = useState(false);

  const [createSlotOpen, setCreateSlotOpen] = useState(false);
  const [createSlotInit, setCreateSlotInit] = useState<{ search?: string; owner?: string }>({});

  const [placeSlotOpen, setPlaceSlotOpen] = useState(false);
  const [placeSlotCode, setPlaceSlotCode] = useState("");

  const [slotLimitOpen, setSlotLimitOpen] = useState(false);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetForm, setResetForm] = useState<ResetDataForm>(EMPTY_RESET);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    apiPost<any[]>("/api/member/get_plan_list", {}, token).then(setPlanList).catch(() => {});

    apiPost<any[]>("/api/country/get", {}, token)
      .then((r) => setCountryList(Array.isArray(r) ? r : []))
      .catch(() => {});

    apiPost("/api/slot/get_currency", {}, token)
      .then((r: any) => {
        setCurrencyList(r);
        if (r?.default_currency) {
          setDefaultCurrencyId(String(r.default_currency.currency_id));
        }
      })
      .catch(() => {});
  }, [token]);

  function handleRefresh() {
    tableRef.current?.refresh();
  }

  function openDetail(slot: SlotData) {
    setSelectedSlot(slot);
    setDetailOpen(true);
    setMembershipOptions(tableRef.current?.getMembershipOptions() ?? []);
  }

  function handleCreateSlotSuccess(slotCode: string) {
    setPlaceSlotCode(slotCode);
    setPlaceSlotOpen(true);
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
    } catch {
      toast.error("Reset failed");
    }
    setResetLoading(false);
  }

  const currencies = Array.isArray(currencyList) ? currencyList : currencyList?.currency_lists ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Member List</h1>
          <p className="text-muted-foreground">Manage member information and there slot</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              setPlaceSlotCode("");
              setPlaceSlotOpen(true);
            }}
          >
            <Dot className="h-4 w-4 mr-1" /> Place Slot
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCreateSlotInit({});
              setCreateSlotOpen(true);
            }}
          >
            <Dot className="h-4 w-4 mr-1" /> Create Slot
          </Button>
          <Button variant="outline" onClick={() => setSlotLimitOpen(true)}>
            <Ban className="h-4 w-4 mr-1" /> Slot Limit/Member
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Member
          </Button>
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RefreshCw className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>
      </div>

      {/* Members table */}
      <MembersTable ref={tableRef} onView={openDetail} />

      {/* Slot view modal */}
      <MemberViewModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        slot={selectedSlot}
        membershipOptions={membershipOptions}
        countryList={countryList}
        planList={planList}
        currencies={currencies}
        defaultCurrencyId={defaultCurrencyId}
        onRefresh={handleRefresh}
      />

      {/* Add Member modal */}
      <AddMemberModal
        open={addOpen}
        onOpenChange={setAddOpen}
        countryList={countryList}
        onMemberAdded={(init) => {
          tableRef.current?.refresh();
          setCreateSlotInit(init);
          setCreateSlotOpen(true);
        }}
      />

      {/* Create Slot modal */}
      <CreateSlotModal
        open={createSlotOpen}
        onOpenChange={setCreateSlotOpen}
        initial={createSlotInit}
        onCreated={handleRefresh}
        onSlotCreated={handleCreateSlotSuccess}
      />

      {/* Place Slot modal */}
      <PlaceSlotModal
        open={placeSlotOpen}
        onOpenChange={setPlaceSlotOpen}
        initialCode={placeSlotCode}
        onPlaced={handleRefresh}
      />

      {/* Slot Limit modal */}
      <SlotLimitModal open={slotLimitOpen} onOpenChange={setSlotLimitOpen} />

      {/* Reset Data modal */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <RefreshCw className="h-4 w-4 inline mr-1" /> Reset Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Enter Security Key for Reset</Label>
              <Input
                type="password"
                value={resetForm.security_key}
                onChange={(e) => setResetForm((f) => ({ ...f, security_key: e.target.value }))}
                placeholder="Enter Security Key"
              />
              <p className="text-xs text-muted-foreground">
                Only administrator who have the security can use this option
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Choose data you would like to reset</Label>
              <div className="space-y-2 mt-2">
                {(["member_list", "slot_list", "plan_settings", "generated_codes", "product_list"] as const).map(
                  (key) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        checked={resetForm[key]}
                        onCheckedChange={(v) => setResetForm((f) => ({ ...f, [key]: v === true }))}
                        id={key}
                      />
                      <Label htmlFor={key} className="text-sm cursor-pointer capitalize">
                        {key.replace(/_/g, " ")}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Close
            </Button>
            <Button onClick={handleResetData} disabled={resetLoading}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {resetLoading ? "Resetting..." : "Reset Slot Information"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}