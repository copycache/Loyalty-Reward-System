"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { History, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

interface MembershipOption {
  membership_id: number | string;
  membership_name: string;
}

interface InformationTabProps {
  slotInfo: Record<string, any>;
  setSlotInfo: React.Dispatch<React.SetStateAction<Record<string, any> | null>>;
  membershipOptions: MembershipOption[];
  countryList: any[];
  onHistory: () => void;
  onCancel: () => void;
  onRefresh: () => void;
}

const setField = (
  setSlotInfo: InformationTabProps["setSlotInfo"],
  field: string,
  value: unknown
) =>
  setSlotInfo((prev: any) =>
    prev ? { ...prev, information: { ...prev.information, [field]: value } } : prev
  );

export function InformationTab({
  slotInfo,
  setSlotInfo,
  membershipOptions,
  countryList,
  onHistory,
  onCancel,
  onRefresh,
}: InformationTabProps) {
  const { token } = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const [submitting, setSubmitting] = useState(false);
  const [hiddenPass, setHiddenPass] = useState(true);
  const [infoSlotList, setInfoSlotList] = useState<any[]>([]);

  async function submit() {
    if (!token || !slotInfo?.information) return;
    setSubmitting(true);
    try {
      await apiPost("/api/member/submit_slot_information", { ...slotInfo.information, user }, token);
      toast.success("Slot information updated");
      onRefresh();
    } catch (err: any) {
      if (err?.status_message) toast.error(err.status_message);
      else toast.error("Failed to update");
    }
    setSubmitting(false);
  }

  async function ownerSearch(q: string) {
    if (!token) return;
    try {
      const res = await apiPost<any[]>("/api/member/slot_info", { name: q }, token);
      setInfoSlotList(Array.isArray(res) ? res : []);
    } catch {
      setInfoSlotList([]);
    }
  }

  function selectOwner(name: string, id: number) {
    if (!slotInfo) return;
    setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, slot_owner: id, name } } : prev);
    apiPost("/api/member/select_users", { id }, token).then((r: any) => {
      setSlotInfo((prev: any) => prev ? { ...prev, information: { ...prev.information, slot_owner: r ?? id } } : prev);
    }).catch(() => {});
  }

  return (
    <TabsContent value="info" className="mt-4 space-y-4">
      <div className="text-sm font-semibold text-muted-foreground border-b pb-2">Slot Information</div>
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Username</Label>
          <div className="flex gap-1">
            <Input size={1} value={slotInfo?.information?.slot_no ?? ""} onChange={(e) => setField(setSlotInfo, "slot_no", e.target.value)} />
            <Button variant="outline" size="icon" onClick={onHistory} title="Username History"><History className="h-3 w-3" /></Button>
          </div>
        </div>
        <div className="space-y-1 relative">
          <Label className="text-xs">Slot Owner</Label>
          <Input size={1} value={slotInfo?.information?.name ?? ""} onChange={(e) => ownerSearch(e.target.value)} placeholder="Enter Owner Name" />
          {infoSlotList.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 max-h-[200px] overflow-y-auto">
              {infoSlotList.map((item: any) => (
                <button key={item.id} type="button" className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent" onClick={() => { selectOwner(item.name, item.id); setInfoSlotList([]); }}>{item.name} ({item.email})</button>
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
          <Select value={String(slotInfo?.information?.slot_membership ?? "")} onValueChange={(v) => setField(setSlotInfo, "slot_membership", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {membershipOptions.map((m) => (<SelectItem key={m.membership_id} value={String(m.membership_id)}>{m.membership_name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Slot Status</Label>
          <Select value={slotInfo?.information?.slot_status ?? "active"} onValueChange={(v) => setField(setSlotInfo, "slot_status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="blocked">Blocked</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email Status</Label>
          <Select value={String(slotInfo?.information?.email_verified ?? "1")} onValueChange={(v) => setField(setSlotInfo, "email_verified", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="1">Activated</SelectItem><SelectItem value="0">Inactive</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">KYC Status</Label>
          <Select value={String(slotInfo?.information?.verified ?? "0")} onValueChange={(v) => setField(setSlotInfo, "verified", Number(v))}>
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
          <Input size={1} value={slotInfo?.information?.store_name ?? ""} onChange={(e) => setField(setSlotInfo, "store_name", e.target.value)} placeholder="Ex. Iqon Elite Corp's Store" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Placement Username</Label>
          <Input size={1} value={slotInfo?.information?.slot_placement_code ?? ""} disabled />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Position</Label>
          <Select value={slotInfo?.information?.slot_position ?? "LEFT"} onValueChange={(v) => setField(setSlotInfo, "slot_position", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="LEFT">Left</SelectItem><SelectItem value="RIGHT">Right</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm font-semibold text-muted-foreground border-b pb-2">Member Information</div>
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">First Name</Label>
          <Input size={1} value={slotInfo?.information?.first_name ?? ""} onChange={(e) => setField(setSlotInfo, "first_name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Middle Name</Label>
          <Input size={1} value={slotInfo?.information?.middle_name ?? ""} onChange={(e) => setField(setSlotInfo, "middle_name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Last Name</Label>
          <Input size={1} value={slotInfo?.information?.last_name ?? ""} onChange={(e) => setField(setSlotInfo, "last_name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">E-Mail</Label>
          <Input size={1} value={slotInfo?.information?.email ?? ""} onChange={(e) => setField(setSlotInfo, "email", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Contact Number</Label>
          <Input size={1} value={slotInfo?.information?.contact ?? ""} onChange={(e) => setField(setSlotInfo, "contact", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Country / Currency</Label>
          <Select value={String(slotInfo?.information?.country_id ?? "")} onValueChange={(v) => setField(setSlotInfo, "country_id", Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {countryList.map((c: any) => (<SelectItem key={c.country_id} value={String(c.country_id)}>{c.country_name} ({c.currency_code})</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        {(slotInfo?.information?.id === 1 ? !hiddenPass : true) && (
          <div className="space-y-1">
            <Label className="text-xs">Password</Label>
            <Input size={1} value={slotInfo?.information?.show_password ?? ""} onChange={(e) => setField(setSlotInfo, "show_password", e.target.value)} />
          </div>
        )}
      </div>

      <div className="text-sm font-semibold text-muted-foreground border-b pb-2">Beneficiary Information</div>
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Beneficiary First Name</Label>
          <Input size={1} value={slotInfo?.information?.beneficiary_first_name ?? ""} onChange={(e) => setField(setSlotInfo, "beneficiary_first_name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Beneficiary Middle Name</Label>
          <Input size={1} value={slotInfo?.information?.beneficiary_middle_name ?? ""} onChange={(e) => setField(setSlotInfo, "beneficiary_middle_name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Beneficiary Last Name</Label>
          <Input size={1} value={slotInfo?.information?.beneficiary_last_name ?? ""} onChange={(e) => setField(setSlotInfo, "beneficiary_last_name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Beneficiary Contact</Label>
          <Input size={1} value={slotInfo?.information?.beneficiary_contact ?? ""} onChange={(e) => setField(setSlotInfo, "beneficiary_contact", e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit} disabled={submitting}>
          <Save className="h-4 w-4 mr-1" /> {submitting ? "Saving..." : "Update Slot Information"}
        </Button>
      </div>
    </TabsContent>
  );
}