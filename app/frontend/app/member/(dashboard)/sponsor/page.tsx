"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Copy, ChevronLeft, ChevronRight, Users, UserPlus, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function MemberSponsorPage() {
  const { token, currentSlot } = useAuthStore();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [referralLink, setReferralLink] = useState("");
  
  // Activation
  const [activatingEntry, setActivatingEntry] = useState<any>(null);
  const [activateForm, setActivateForm] = useState({
      code: "",
      pin: ""
  });
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (currentSlot?.slot_no) {
      setReferralLink(`${window.location.origin}/store/link/${currentSlot.slot_no}`);
    }
  }, [currentSlot]);

  const fetchReferrals = async (pg: number) => {
    try {
      const res = await apiPost("/api/member_sponsor/get_sponsor_list", { slot_id: currentSlot?.slot_id, page: pg, search }, token);
      if (res?.data) {
        setReferrals(res.data.data || res.data);
        setTotalPages(res.data.last_page || 1);
      } else if (res?.d_sponsor || res?.l_sponsor) {
          // Fallback if API returns legacy structure (though unlikely given Next.js existing code)
          const all = [...(res.d_sponsor || []), ...(res.l_sponsor || [])];
          setReferrals(all);
      }
    } catch {
      console.error("Failed to load referrals");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchReferrals(page);
  }, [token, page, search]);

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied!");
    }
  };

  const handleActivate = async () => {
      if (!activatingEntry) return;
      setIsActivating(true);
      try {
          // Legacy behavior: sends the full referral object with code, pin, and updated slot_sponsored (current user)
          const payload = {
              ...activatingEntry,
              code: activateForm.code,
              pin: activateForm.pin,
              slot_sponsored: currentSlot?.slot_no
          };
          
          await apiPost("/api/member_sponsor/activate_slot", payload, token);
          
          toast.success(`Successfully activated slot ${activatingEntry.slot_no}`);
          setActivatingEntry(null);
          setActivateForm({ code: "", pin: "" });
          fetchReferrals(page); // Refresh list
      } catch (e: any) {
          toast.error(e?.message || "Activation failed.");
      }
      setIsActivating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold">My Referrals</h1>
            <p className="text-muted-foreground text-sm">Manage your sponsored members and activations.</p>
        </div>
        <Button variant="outline" onClick={copyLink}>
          <Copy className="h-4 w-4 mr-1" /> Copy Referral Link
        </Button>
      </div>

      {currentSlot && (
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Your referral link</p>
            <div className="flex gap-2">
                <code className="flex-1 bg-background p-2 rounded border font-mono text-sm break-all">
                {referralLink || "Loading..."}
                </code>
                <Button size="icon" variant="ghost" onClick={copyLink} className="shrink-0">
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 max-w-sm">
        <Input placeholder="Search referrals..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchReferrals(1)} />
        <Button variant="outline" onClick={() => fetchReferrals(1)}><Search className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : referrals.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <h3 className="text-lg font-medium">No referrals found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
              Share your referral link to start building your team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {referrals.map((ref: any) => (
            <Card key={ref.id} className="overflow-hidden">
              <CardContent className="p-0">
                  <div className="p-4 flex items-start gap-3">
                    <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="bg-green-50 text-green-700 text-xs font-bold">
                        {ref.name?.charAt(0) || "?"}
                    </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm truncate pr-2">{ref.name}</p>
                        <Badge variant={ref.status === "active" ? "default" : "secondary"} className="text-[10px] uppercase shrink-0">
                            {ref.status || "Inactive"}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{ref.slot_no}</p>
                    <p className="text-xs text-muted-foreground truncate">{ref.email}</p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 px-4 py-2 border-t text-xs flex justify-between items-center">
                      <span className="text-muted-foreground">{ref.slot_date_created}</span>
                      
                      {/* Activation Button for Pending Slots (legacy check: slot_type == '--' or status != active) */}
                      {(ref.slot_type === '--' || ref.status !== 'active') && (
                          <Dialog open={activatingEntry?.id === ref.id} onOpenChange={(open) => !open && setActivatingEntry(null)}>
                              <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => setActivatingEntry(ref)}>
                                      <UserPlus className="h-3 w-3 mr-1" /> Activate
                                  </Button>
                              </DialogTrigger>
                              <DialogContent>
                                  <DialogHeader>
                                      <DialogTitle>Activate Slot: {ref.slot_no}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-2">
                                      <div className="grid gap-2">
                                          <Label>Code</Label>
                                          <Input value={activateForm.code} onChange={(e) => setActivateForm(p => ({...p, code: e.target.value}))} placeholder="Activation Code" />
                                      </div>
                                      <div className="grid gap-2">
                                          <Label>Pin</Label>
                                          <Input value={activateForm.pin} onChange={(e) => setActivateForm(p => ({...p, pin: e.target.value}))} placeholder="Pin" />
                                      </div>
                                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleActivate} disabled={isActivating}>
                                          {isActivating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                          Activate Slot
                                      </Button>
                                  </div>
                              </DialogContent>
                          </Dialog>
                      )}
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
