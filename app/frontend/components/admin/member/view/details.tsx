"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

interface SlotData {
  slot_id: number;
  [key: string]: unknown;
}

interface DetailsTabProps {
  slot: SlotData | null;
  active: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 min-h-[28px]">
      <span className="text-xs text-muted-foreground w-[140px] text-right shrink-0">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

function formatDateTime(d?: string) {
  if (!d) return "—";
  try { const dt = new Date(d); return `${dt.toLocaleDateString()} (${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`; } catch { return d; }
}

export function DetailsTab({ slot, active, onRefresh, onClose }: DetailsTabProps) {
  const { token } = useAuthStore();
  const [slotDetails, setSlotDetails] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!active || !slot || !token) return;
    let cancelled = false;
    setSlotDetails(null);
    apiPost<any>("/api/member/get_slot_details", { id: slot.slot_id }, token)
      .then((d) => { if (!cancelled) setSlotDetails(d); })
      .catch(() => { if (!cancelled) setSlotDetails({}); });
    return () => { cancelled = true; };
  }, [active, slot, token]);

  async function handleVerify(slotId: number, status: "verified" | "rejected") {
    if (!token) return;
    try {
      await apiPost("/api/member/user_verification", { id: slotId, status }, token);
      toast.success(`Member ${status}`);
      onRefresh();
      onClose();
    } catch { toast.error("Verification failed"); }
  }

  return (
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
                <Button variant="destructive" onClick={() => handleVerify(slot!.slot_id, "rejected")}>Set as Rejected</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleVerify(slot!.slot_id, "verified")}>Set as Verified</Button>
              </>
            )}
            {Number(slotDetails.verified) === 3 && <span className="text-red-600 font-medium">Rejected</span>}
          </div>
        </>
      )}
    </TabsContent>
  );
}