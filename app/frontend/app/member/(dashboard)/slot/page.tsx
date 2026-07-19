"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Search, Wallet, TrendingUp } from "lucide-react";

export default function MemberSlotPage() {
  const { token, currentSlot, loadCurrentSlot } = useAuthStore();
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [sponsorPreview, setSponsorPreview] = useState<any>(null);
  
  // Earnings Data
  const [totalEarned, setTotalEarned] = useState<any>(0);
  const [planTotal, setPlanTotal] = useState<any[]>([]);

  const [createForm, setCreateForm] = useState({
    code: "",
    pin: "",
    sponsor_slot_no: "",
    position: "left",
  });

  const [activateForm, setActivateForm] = useState({
    slot_id: "",
    code: "",
    pin: "",
  });

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const [slotsRes, pkgRes, earningsRes] = await Promise.all([
          apiPost("/api/all_slot", {}, token),
          apiPost("/api/member/get_own_membership_list", {}, token),
          apiPost("/api/get_total", {}, token)
        ]);

        if (slotsRes?.data) setSlots(slotsRes.data);
        if (pkgRes?.data) setPackages(pkgRes.data);
        
        if (earningsRes) {
            // Log structure to verify if needed, but assuming legacy structure
            setTotalEarned(earningsRes.total_running_balance || 0);
            if (Array.isArray(earningsRes.total)) {
                setPlanTotal(earningsRes.total);
            }
        }

      } catch (e) {
        console.error("Failed to load slot data", e);
      }
      setLoading(false);
    };
    loadData();
  }, [token]);

  const searchSponsor = async () => {
    if (!createForm.sponsor_slot_no) return;
    try {
      const res = await apiPost("/api/check_sponsor", { slot_no: createForm.sponsor_slot_no }, token);
      if (res?.data) {
        setSponsorPreview(res.data);
      } else {
        setSponsorPreview(null);
        toast.error("Sponsor not found.");
      }
    } catch {
      toast.error("Sponsor not found.");
    }
  };

  const handleCreate = async () => {
    if (!createForm.code || !createForm.pin) {
      toast.error("Please enter activation code and pin.");
      return;
    }
    setCreating(true);
    try {
      await apiPost("/api/slot/add_slot", {
        slot: {
          code: createForm.code,
          pin: createForm.pin,
          slot_sponsor: createForm.sponsor_slot_no,
        },
        slot_id: currentSlot?.slot_id,
      }, token);
      toast.success("Slot created!");
      // Reload slots
      const slotsRes = await apiPost("/api/all_slot", {}, token);
      if (slotsRes?.data) setSlots(slotsRes.data);
      await loadCurrentSlot();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create slot.");
    }
    setCreating(false);
  };

  const handleActivate = async () => {
    if (!activateForm.slot_id || !activateForm.code) {
      toast.error("Please fill in all fields.");
      return;
    }
    setActivating(true);
    try {
      await apiPost("/api/member/activate_product_code", activateForm, token);
      toast.success("Slot activated!");
      const slotsRes = await apiPost("/api/all_slot", {}, token);
      if (slotsRes?.data) setSlots(slotsRes.data);
      await loadCurrentSlot();
    } catch (err: any) {
      toast.error(err?.message || "Activation failed.");
    }
    setActivating(false);
  };

  const switchSlot = async (slotId: number) => {
    try {
      await apiPost("/api/current_slot", { slot_id: slotId }, token);
      await loadCurrentSlot();
      toast.success("Slot switched!");
    } catch {
      toast.error("Failed to switch slot.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Slot Management</h1>
        <div className="flex gap-2">
          {/* Create and Activate Dialogs remain unchanged */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-1" /> Create Slot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Slot</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Activation Code</Label>
                  <Input value={createForm.code} onChange={(e) => setCreateForm(p => ({ ...p, code: e.target.value }))} placeholder="Enter activation code" />
                </div>
                <div className="space-y-2">
                  <Label>Pin</Label>
                  <Input value={createForm.pin} onChange={(e) => setCreateForm(p => ({ ...p, pin: e.target.value }))} placeholder="Enter pin" />
                </div>
                <div className="space-y-2">
                  <Label>Sponsor Slot No.</Label>
                  <div className="flex gap-2">
                    <Input value={createForm.sponsor_slot_no} onChange={(e) => setCreateForm(p => ({ ...p, sponsor_slot_no: e.target.value }))} placeholder="e.g. SN-000001" />
                    <Button variant="outline" onClick={searchSponsor}><Search className="h-4 w-4" /></Button>
                  </div>
                  {sponsorPreview && (
                    <p className="text-sm text-green-600">Sponsor: {sponsorPreview.name} ({sponsorPreview.slot_no})</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select value={createForm.position} onValueChange={(v) => setCreateForm(p => ({ ...p, position: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCreate} disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Slot
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Activate Slot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Activate Slot</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Slot</Label>
                  <Select value={activateForm.slot_id} onValueChange={(v) => setActivateForm(p => ({ ...p, slot_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select slot" /></SelectTrigger>
                    <SelectContent>
                      {slots.filter((s: any) => s.status !== "active").map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.slot_no}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Activation Code</Label>
                  <Input value={activateForm.code} onChange={(e) => setActivateForm(p => ({ ...p, code: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Pin</Label>
                  <Input value={activateForm.pin} onChange={(e) => setActivateForm(p => ({ ...p, pin: e.target.value }))} />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleActivate} disabled={activating}>
                  {activating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Activate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20 md:col-span-1">
            <CardContent className="p-4 flex flex-col justify-center h-full">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Overall Earnings
                </p>
                <p className="text-2xl font-bold text-primary mt-1">
                    PHP {parseFloat(totalEarned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </CardContent>
        </Card>
        <Card className="md:col-span-3">
             <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Earnings Breakdown
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {planTotal.map((plan: any, idx: number) => (
                        <div key={idx} className="bg-muted/50 p-2 rounded-md">
                             <p className="text-xs text-muted-foreground truncate" title={plan.plan_name}>{plan.plan_name}</p>
                             <p className="font-semibold text-sm">
                                {parseFloat(plan.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </p>
                        </div>
                    ))}
                    {planTotal.length === 0 && <p className="text-xs text-muted-foreground col-span-full">No earnings to display.</p>}
                </div>
             </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {slots.map((slot: any) => (
          <Card key={slot.id} className={`${currentSlot?.id === slot.id ? "border-green-500 border-2 shadow-md" : "hover:border-green-200 transition-colors"}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-lg">{slot.slot_no}</p>
                <Badge variant={slot.status === "active" ? "default" : "secondary"} className="uppercase text-[10px]">
                    {slot.status}
                </Badge>
              </div>
              
              <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{slot.package_name || slot.membership_name || "No Package"}</p>
                  {slot.rank_name && <p className="text-xs text-muted-foreground">Rank: <span className="font-medium text-foreground">{slot.rank_name}</span></p>}
              </div>

              <div className="pt-2 border-t space-y-1.5">
                  <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Sponsor:</span>
                      <span className="font-medium truncate max-w-[120px]" title={slot.sponsor ? slot.sponsor.slot_no : "No Sponsor"}>
                          {slot.sponsor ? slot.sponsor.slot_no : "No Sponsor"}
                      </span>
                  </div>
                  <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total Earning:</span>
                      <span className="font-medium text-green-600">
                          {slot.currency} {parseFloat(slot.earning || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                  </div>
                  <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Wallet:</span>
                      <span className="font-medium">
                          {slot.currency} {parseFloat(slot.wallet || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                  </div>
              </div>

              {currentSlot?.id !== slot.id ? (
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => switchSlot(slot.id)}>
                  Switch to this slot
                </Button>
              ) : (
                <div className="bg-green-50 text-green-700 text-xs font-semibold py-2 px-3 rounded text-center mt-2 border border-green-100">
                    Currently Signed In
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
