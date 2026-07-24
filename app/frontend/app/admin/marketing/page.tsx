"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Megaphone, Settings, DollarSign, ToggleLeft, CreditCard, RefreshCw, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";

interface PlanSetting {
  [key: string]: any;
}

interface PlanData {
  settings: PlanSetting;
  label: string;
  status: string;
  trigger?: string;
}

export default function AdminMarketingPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Record<string, PlanData>>({});
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [planTab, setPlanTab] = useState("direct");
  const [planLabel, setPlanLabel] = useState<Record<string, string>>({});
  const [planSettings, setPlanSettings] = useState<Record<string, PlanSetting>>({});
  const [planStatus, setPlanStatus] = useState<Record<string, string>>({});
  const [membershipList, setMembershipList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [manageMembershipOpen, setManageMembershipOpen] = useState(false);
  const [manageMembershipData, setManageMembershipData] = useState<any[]>([]);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customizeData, setCustomizeData] = useState<any>({});
  const [investmentOpen, setInvestmentOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState({ min_amount: 0, max_amount: 0 });
  const [packageData, setPackageData] = useState<any[]>([]);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currency, setCurrency] = useState<any>({});
  const [abbreviation, setAbbreviation] = useState("PHP");

  const planKeys = ["DIRECT", "INDIRECT", "UNILEVEL", "BINARY", "BINARY_REPURCHASE", "DROPSHIPPING_BONUS", "WELCOME_BONUS"];

  const loadPlan = useCallback(async (plan: string) => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/plan/get", { plan }, token);
      if (res) {
        setPlanSettings(prev => ({ ...prev, [plan]: res.settings || {} }));
        setPlanLabel(prev => ({ ...prev, [plan]: res.label || plan }));
        setPlanStatus(prev => ({ ...prev, [plan]: String(res.status ?? "0") }));
      }
    } catch { /* ignore */ }
  }, [token]);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const results = await Promise.all(planKeys.map(p => apiPost<any>("/api/plan/get", { plan: p }, token).catch(() => null)));
    const newSettings: Record<string, PlanSetting> = {};
    const newLabel: Record<string, string> = {};
    const newStatus: Record<string, string> = {};
    results.forEach((res, i) => {
      const key = planKeys[i];
      if (res) {
        newSettings[key] = res.settings || {};
        newLabel[key] = res.label || key;
        newStatus[key] = String(res.status ?? "0");
      }
    });
    setPlanSettings(newSettings);
    setPlanLabel(newLabel);
    setPlanStatus(newStatus);
    setLoading(false);
  }, [token]);

  const loadMembership = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/membership/get", {}, token);
      setMembershipList(Array.isArray(res) ? res : []);
    } catch { /* ignore */ }
  }, [token]);

  const loadManageMembership = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/membership/get_manage_settings", {}, token);
      setManageMembershipData(Array.isArray(res) ? res : []);
    } catch { /* ignore */ }
  }, [token]);

  const loadCustomizeSettings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/customize_data/get", {}, token);
      setCustomizeData(res || {});
    } catch { /* ignore */ }
  }, [token]);

  const loadPackage = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/investment_package/get", {}, token);
      setPackageData(Array.isArray(res) ? res : []);
    } catch { /* ignore */ }
  }, [token]);

  const loadInvestmentAmount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/investment/getinvestment_amount", {}, token);
      if (res) setInvestmentAmount(res);
    } catch { /* ignore */ }
  }, [token]);

  const loadCurrency = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/currency/get", {}, token);
      if (res) setCurrency(res);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => { loadAll(); loadMembership(); loadManageMembership(); loadCustomizeSettings(); loadPackage(); loadInvestmentAmount(); loadCurrency(); }, []);

  const updatePlan = async (plan: string) => {
    if (!token) return;
    setSaving(true);
    try {
      const data = { ...planSettings[plan] };
      if (plan !== "BINARY_REPURCHASE" && plan !== "DROPSHIPPING_BONUS") {
        data.membership_settings = membershipList;
      }
      await apiPost("/api/plan/update", { plan, label: planLabel[plan], trigger: "", data: JSON.stringify(data) }, token);
      toast.success("Plan updated");
      loadPlan(plan);
    } catch { toast.error("Failed to update plan"); }
    setSaving(false);
  };

  const updateStatus = async (plan: string, send: number) => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/plan/update_status", { plan, send }, token);
      setPlanStatus(prev => ({ ...prev, [plan]: String(res?.update_status ?? send) }));
      toast.success(res?.status_message || "Status updated");
    } catch { toast.error("Failed to update status"); }
  };

  const openPlan = (plan: string) => {
    setActivePlan(plan);
    setPlanTab(plan.toLowerCase());
  };

  const planName = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const planTrigger: Record<string, string> = {
    DIRECT: "Slot Creation", INDIRECT: "Slot Creation", UNILEVEL: "Product Repurchase",
    BINARY: "Slot Placement", BINARY_REPURCHASE: "Product Repurchase",
    DROPSHIPPING_BONUS: "Special Plan", WELCOME_BONUS: "Slot Creation",
  };
  const planGenealogy: Record<string, string> = {
    DIRECT: "Unilevel Genealogy", INDIRECT: "Unilevel Genealogy", UNILEVEL: "Unilevel Genealogy",
    BINARY: "Binary Genealogy", BINARY_REPURCHASE: "Binary Genealogy",
    DROPSHIPPING_BONUS: "No Genealogy", WELCOME_BONUS: "No Genealogy",
  };

  const membershipSubmit = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiPost("/api/membership/submit", manageMembershipData, token);
      toast.success("Membership updated");
      setManageMembershipOpen(false);
      loadManageMembership();
      loadMembership();
    } catch { toast.error("Failed"); }
    setSaving(false);
  };

  const customizedSubmit = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await apiPost<any>("/api/customize_data/update", customizeData, token);
      setCustomizeData(res || customizeData);
      toast.success("Settings updated");
      setCustomizeOpen(false);
    } catch { toast.error("Failed"); }
    setSaving(false);
  };

  const toggleFeature = (feature: string) => {
    setCustomizeData((prev: any) => {
      const updated = { ...prev };
      if (feature === "replicated_member") {
        updated[feature] = { ...updated[feature], replicated_sponsoring: updated[feature]?.replicated_sponsoring === 0 ? 1 : 0 };
      } else {
        updated[feature] = { ...updated[feature], mlm_feature_enable: updated[feature]?.mlm_feature_enable === 0 ? 1 : 0 };
      }
      return updated;
    });
  };

  const addMembership = () => {
    setManageMembershipData(prev => [
      ...prev,
      { membership_id: null, membership_name: "", hierarchy: (prev.length + 1), enable_commission: 0, free_slot_membership: 0, membership_transfer: 0, product_transfer: 0, auto_activate_product_code: 0, color: "#ffffff", archive: 0 },
    ]);
  };

  const toggleCheckBox = (i: number, field: string) => {
    setManageMembershipData((prev: any[]) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: updated[i][field] === 0 ? 1 : 0 };
      return updated;
    });
  };

  const addPackage = (i: number) => {
    setPackageData(prev => [...prev, { investment_package_id: null, investment_package_days_bond: "", investment_package_min_interest: "", investment_package_max_interest: "", investment_package_days_margin: "", bind_membership: 0, archive: 0 }]);
  };

  const removePackage = (i: number) => {
    setPackageData((prev: any[]) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], archive: 1 };
      return updated;
    });
  };

  const packageSubmit = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiPost("/api/investment_package/submit", packageData, token);
      toast.success("Package updated");
      loadPackage();
    } catch { toast.error("Failed"); }
    setSaving(false);
  };

  const updateInvestmentAmount = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiPost("/api/investment/update_investment_amount", investmentAmount, token);
      toast.success("Investment amount updated");
      loadInvestmentAmount();
    } catch { toast.error("Failed"); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Plan</h1>
          <p className="text-muted-foreground">Manage marketing plan and computations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrencyOpen(true)}>
            <CreditCard className="h-4 w-4 mr-2" />
            Currency Configuration
          </Button>
          <Button variant="outline" onClick={() => { loadPackage(); loadInvestmentAmount(); setInvestmentOpen(true); }}>
            <DollarSign className="h-4 w-4 mr-2" />
            Investment Configuration
          </Button>
          <Button variant="outline" onClick={() => { loadCustomizeSettings(); setCustomizeOpen(true); }}>
            <ToggleLeft className="h-4 w-4 mr-2" />
            Customize Settings
          </Button>
          <Button variant="outline" onClick={() => { loadManageMembership(); setManageMembershipOpen(true); }}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Membership
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complan Name</TableHead>
                <TableHead>Earning Label</TableHead>
                <TableHead>Genealogy Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  </TableCell>
                </TableRow>
              ) : (
                planKeys.map((key) => (
                  <TableRow key={key} className="cursor-pointer hover:bg-muted/50" onClick={() => openPlan(key)}>
                    <TableCell className="font-medium">{planName(key)}</TableCell>
                    <TableCell>{planLabel[key] || planName(key)}</TableCell>
                    <TableCell>{planGenealogy[key]}</TableCell>
                    <TableCell>{planTrigger[key]}</TableCell>
                    <TableCell>
                      {planStatus[key] === "1" ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">ACTIVE</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">INACTIVE</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Complan Settings Modal */}
      <Dialog open={!!activePlan} onOpenChange={(open) => { if (!open) setActivePlan(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Complan Settings - {activePlan ? planName(activePlan) : ""}
            </DialogTitle>
          </DialogHeader>
          {activePlan && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Earning Label</Label>
                <Input value={planLabel[activePlan] || ""} onChange={(e) => setPlanLabel(prev => ({ ...prev, [activePlan]: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={planStatus[activePlan] === "0" ? "default" : "outline"} onClick={() => updateStatus(activePlan, 1)} disabled={planStatus[activePlan] === "1"}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Enable {planName(activePlan)}
                </Button>
                <Button size="sm" variant={planStatus[activePlan] === "1" ? "destructive" : "outline"} onClick={() => updateStatus(activePlan, 0)} disabled={planStatus[activePlan] === "0"}>
                  <XCircle className="h-4 w-4 mr-1" /> Disable {planName(activePlan)}
                </Button>
                <Button size="sm" onClick={() => updatePlan(activePlan)} disabled={saving}>
                  {saving ? "Saving..." : "Update & Enable"}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivePlan(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Membership Modal */}
      <Dialog open={manageMembershipOpen} onOpenChange={setManageMembershipOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Membership</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Hierarchy</TableHead>
                <TableHead>Enable Commission</TableHead>
                <TableHead>Free Slot</TableHead>
                <TableHead>Membership Transfer</TableHead>
                <TableHead>Product Transfer</TableHead>
                <TableHead>Auto Activate</TableHead>
                <TableHead>Color</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manageMembershipData.filter((m: any) => m.archive !== 1).map((data: any, i: number) => (
                <TableRow key={i}>
                  <TableCell><Input value={data.membership_name || ""} onChange={(e) => { const u = [...manageMembershipData]; u[i] = { ...u[i], membership_name: e.target.value }; setManageMembershipData(u); }} /></TableCell>
                  <TableCell><Input type="number" value={data.hierarchy || 0} onChange={(e) => { const u = [...manageMembershipData]; u[i] = { ...u[i], hierarchy: e.target.value }; setManageMembershipData(u); }} /></TableCell>
                  <TableCell className="text-center"><input type="checkbox" checked={data.enable_commission === 0} onChange={() => toggleCheckBox(i, "enable_commission")} /></TableCell>
                  <TableCell className="text-center"><input type="checkbox" checked={data.free_slot_membership === 1} onChange={() => toggleCheckBox(i, "free_slot_membership")} /></TableCell>
                  <TableCell className="text-center"><input type="checkbox" checked={data.membership_transfer === 1} onChange={() => toggleCheckBox(i, "membership_transfer")} /></TableCell>
                  <TableCell className="text-center"><input type="checkbox" checked={data.product_transfer === 1} onChange={() => toggleCheckBox(i, "product_transfer")} /></TableCell>
                  <TableCell className="text-center"><input type="checkbox" checked={data.auto_activate_product_code === 1} onChange={() => toggleCheckBox(i, "auto_activate_product_code")} /></TableCell>
                  <TableCell><Input type="color" value={data.color || "#ffffff"} onChange={(e) => { const u = [...manageMembershipData]; u[i] = { ...u[i], color: e.target.value }; setManageMembershipData(u); }} /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => { const u = [...manageMembershipData]; u[i] = { ...u[i], archive: 1 }; setManageMembershipData(u); }}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="outline" size="sm" onClick={addMembership}><Plus className="h-4 w-4 mr-1" /> Add Membership</Button>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageMembershipOpen(false)}>Close</Button>
            <Button onClick={membershipSubmit} disabled={saving}>Update Membership</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customize Settings Modal */}
      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Customize Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {["replicated_member", "product_replicated", "store_replicated", "send_wallet", "conversion_wallet", "auto_distribute"].map((feat) => {
              const feature = customizeData[feat];
              const enabled = feat === "replicated_member" ? feature?.replicated_sponsoring === 0 : feature?.mlm_feature_enable === 0;
              return (
                <div key={feat} className="flex items-center justify-between">
                  <Label className="capitalize">{feat.replace(/_/g, " ")}</Label>
                  <input type="checkbox" checked={enabled} onChange={() => toggleFeature(feat)} />
                </div>
              );
            })}
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Code Transfer</h4>
              <div className="flex items-center justify-between">
                <Label>Code Transfer (Member)</Label>
                <input type="checkbox" checked={customizeData?.code_transfer?.mlm_feature_enable === 0} onChange={() => toggleFeature("code_transfer")} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Code Transfer (Non-member)</Label>
                <input type="checkbox" checked={customizeData?.code_transfer_non?.mlm_feature_enable === 0} onChange={() => toggleFeature("code_transfer_non")} />
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Add Slot Settings</h4>
              <div className="space-y-2">
                <Label>Sponsor Selection</Label>
                <select className="w-full h-10 rounded-md border px-3 text-sm" value={customizeData?.add_slot_sponsor_selection || "0"} onChange={(e) => setCustomizeData((prev: any) => ({ ...prev, add_slot_sponsor_selection: e.target.value }))}>
                  <option value="0">Manual Input</option>
                  <option value="1">Manual Selection</option>
                  <option value="2">Automatic (Per Slot)</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomizeOpen(false)}>Close</Button>
            <Button onClick={customizedSubmit} disabled={saving}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Investment Configuration Modal */}
      <Dialog open={investmentOpen} onOpenChange={setInvestmentOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Investment Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <Label>Minimum Amount to Invest</Label>
                <Input type="number" value={investmentAmount.min_amount} onChange={(e) => setInvestmentAmount(prev => ({ ...prev, min_amount: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1">
                <Label>Maximum Amount to Invest</Label>
                <Input type="number" value={investmentAmount.max_amount} onChange={(e) => setInvestmentAmount(prev => ({ ...prev, max_amount: Number(e.target.value) }))} />
              </div>
              <Button onClick={updateInvestmentAmount} disabled={saving}>Update Amount</Button>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Investment Packages</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Days Bond</TableHead>
                    <TableHead>Min Interest(%)</TableHead>
                    <TableHead>Max Interest(%)</TableHead>
                    <TableHead>Days Margin</TableHead>
                    <TableHead>Bind Membership</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packageData.filter((p: any) => p.archive !== 1).map((pkg: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell><Input type="number" value={pkg.investment_package_days_bond || ""} onChange={(e) => { const u = [...packageData]; u[i] = { ...u[i], investment_package_days_bond: e.target.value }; setPackageData(u); }} /></TableCell>
                      <TableCell><Input type="number" value={pkg.investment_package_min_interest || ""} onChange={(e) => { const u = [...packageData]; u[i] = { ...u[i], investment_package_min_interest: e.target.value }; setPackageData(u); }} /></TableCell>
                      <TableCell><Input type="number" value={pkg.investment_package_max_interest || ""} onChange={(e) => { const u = [...packageData]; u[i] = { ...u[i], investment_package_max_interest: e.target.value }; setPackageData(u); }} /></TableCell>
                      <TableCell><Input type="number" value={pkg.investment_package_days_margin || ""} onChange={(e) => { const u = [...packageData]; u[i] = { ...u[i], investment_package_days_margin: e.target.value }; setPackageData(u); }} /></TableCell>
                      <TableCell>
                        <select className="w-full h-10 rounded-md border px-3 text-sm" value={pkg.bind_membership || 0} onChange={(e) => { const u = [...packageData]; u[i] = { ...u[i], bind_membership: Number(e.target.value) }; setPackageData(u); }}>
                          <option value={0}>ALL</option>
                          {membershipList.map((m: any) => (<option key={m.membership_id} value={m.membership_id}>{m.membership_name}</option>))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removePackage(i)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => addPackage(packageData.length)}><Plus className="h-4 w-4 mr-1" /> Add Package</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvestmentOpen(false)}>Close</Button>
            <Button onClick={packageSubmit} disabled={saving}>Update Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Currency Configuration Modal */}
      <Dialog open={currencyOpen} onOpenChange={setCurrencyOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Currency Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency Name</TableHead>
                  <TableHead>Currency for Buying</TableHead>
                  <TableHead>Currency for Earning</TableHead>
                  <TableHead>Currency Enable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(currency?.currency || []).map((cur: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{cur.currency_name} ({cur.currency_abbreviation})</TableCell>
                    <TableCell className="text-center"><input type="radio" name="buying" checked={cur.currency_buying === 1} readOnly /></TableCell>
                    <TableCell className="text-center"><input type="radio" name="earning" checked={cur.currency_default === 1} readOnly /></TableCell>
                    <TableCell className="text-center"><input type="checkbox" checked={cur.currency_enable === 1} readOnly /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrencyOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
