"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  RefreshCw,
  Network,
  Settings,
  Eye,
  Save,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

const PLAN_CODES = [
  { code: "DIRECT", label: "Direct Referral" },
  { code: "INDIRECT", label: "Indirect Referral" },
  { code: "UNILEVEL", label: "Unilevel Bonus" },
  { code: "STAIRSTEP", label: "Stair Step" },
  { code: "BINARY", label: "Binary" },
  { code: "CASHBACK", label: "Cashback" },
  { code: "BOARD", label: "Board Plan" },
  { code: "MONOLINE", label: "Monoline" },
  { code: "PASS_UP", label: "Pass-Up" },
  { code: "LEVELING_BONUS", label: "Leveling Bonus" },
  { code: "UNILEVEL_OR", label: "Unilevel Override" },
  { code: "UNIVERSAL_POOL_BONUS", label: "Universal Pool Bonus" },
  { code: "INCENTIVE_BONUS", label: "Incentive Bonus" },
  { code: "SIGN_UP_BONUS", label: "Sign-Up Bonus" },
  { code: "GLOBAL_POOL_BONUS", label: "Global Pool Bonus" },
  { code: "PERSONAL_CASHBACK", label: "Personal Cashback" },
  { code: "SPONSOR_MATCHING_BONUS", label: "Sponsor Matching Bonus" },
  { code: "SHARE_LINK", label: "Share Link" },
  { code: "WATCH_EARN", label: "Watch & Earn" },
  { code: "MEMBERSHIP_UPGRADE", label: "Membership Upgrade" },
  { code: "RETAILER_COMMISSION", label: "Retailer Commission" },
  { code: "OVERRIDING_COMMISSION", label: "Overriding Commission" },
  { code: "PRODUCT_DIRECT_REFERRAL", label: "Product Direct Referral" },
  { code: "DIRECT_PERSONAL_CASHBACK", label: "Direct Personal Cashback" },
  { code: "PRODUCT_PERSONAL_CASHBACK", label: "Product Personal Cashback" },
  { code: "TEAM_SALES_BONUS", label: "Team Sales Bonus" },
  { code: "RETAILER_OVERRIDE", label: "Retailer Override" },
  { code: "REVERSE_PASS_UP", label: "Reverse Pass-Up" },
  { code: "ACHIEVERS_RANK", label: "Achievers Rank" },
  { code: "DROPSHIPPING_BONUS", label: "Dropshipping Bonus" },
  { code: "WELCOME_BONUS", label: "Welcome Bonus" },
  { code: "UNILEVEL_MATRIX_BONUS", label: "Unilevel Matrix Bonus" },
  { code: "REWARD_POINTS", label: "Reward Points" },
  { code: "INFINITY_BONUS", label: "Infinity Bonus" },
  { code: "MARKETING_SUPPORT", label: "Marketing Support" },
  { code: "LEADERS_SUPPORT", label: "Leaders Support" },
  { code: "MILESTONE_BONUS", label: "Milestone Bonus" },
];

export default function AdminPlansPage() {
  const { token } = useAuthStore();
  const [planLabels, setPlanLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Plan detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [planDataLoading, setPlanDataLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState("plans");

  // Currencies
  const [currencies, setCurrencies] = useState<any[]>([]);

  // Memberships
  const [memberships, setMemberships] = useState<any[]>([]);

  const loadPlanLabels = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiPost<any>("/api/get_plan_label", {}, token);
      setPlanLabels(res || {});
    } catch (err: any) {
      console.error("Failed to load plan labels:", err);
    }
    setLoading(false);
  }, [token]);

  const loadCurrencies = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/currency/get", {}, token);
      setCurrencies(Array.isArray(res) ? res : (res?.data || []));
    } catch { /* optional */ }
  }, [token]);

  const loadMemberships = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/membership/get", {}, token);
      setMemberships(Array.isArray(res) ? res : (res?.data || []));
    } catch { /* optional */ }
  }, [token]);

  useEffect(() => { loadPlanLabels(); loadCurrencies(); loadMemberships(); }, [loadPlanLabels, loadCurrencies, loadMemberships]);

  const openPlanDetail = async (plan: any) => {
    setSelectedPlan(plan);
    setDetailOpen(true);
    setPlanDataLoading(true);
    try {
      const res = await apiPost<any>("/api/plan/get", { plan: plan.code }, token);
      setPlanData(res);
    } catch {
      setPlanData(null);
    }
    setPlanDataLoading(false);
  };

  const handleTogglePlan = async (planCode: string, enabled: boolean) => {
    if (!token) return;
    try {
      await apiPost("/api/plan/update_status", { plan: planCode, send: enabled ? 1 : 0 }, token);
      toast.success(`Plan ${enabled ? "enabled" : "disabled"}`);
      loadPlanLabels();
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan status");
    }
  };

  const handleSavePlan = async () => {
    if (!token || !selectedPlan || !planData) return;
    setSaving(true);
    try {
      await apiPost("/api/plan/update", {
        plan: selectedPlan.code,
        label: planData.label,
        data: planData.settings,
        trigger: planData.trigger,
      }, token);
      toast.success("Plan settings saved");
      setDetailOpen(false);
      loadPlanLabels();
    } catch (err: any) {
      toast.error(err.message || "Failed to save plan");
    }
    setSaving(false);
  };

  const renderPlanFields = () => {
    if (!planData) return null;

    // If it's an array, render as list
    if (Array.isArray(planData)) {
      return (
        <div className="space-y-3">
          {planData.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between border-b pb-2">
              <Label className="text-sm">{item.label || item.name || item.key || `Level ${i + 1}`}</Label>
              <Input
                className="w-32"
                value={item.value ?? item.percentage ?? ""}
                onChange={(e) => {
                  const updated = [...planData];
                  if ("percentage" in item) {
                    updated[i] = { ...item, percentage: e.target.value };
                  } else {
                    updated[i] = { ...item, value: e.target.value };
                  }
                  setPlanData(updated);
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    // Object: render key-value pairs
    const entries = Object.entries(planData).filter(
      ([key]) => !["id", "created_at", "updated_at", "plan_id", "mlm_plan_id"].includes(key)
    );

    return (
      <div className="space-y-4">
        {entries.map(([key, value]) => {
          const displayLabel = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

          if (value === true || value === false || value === 0 || value === 1 || value === "0" || value === "1") {
            return (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm">{displayLabel}</Label>
                <Switch
                  checked={value === true || value === 1 || value === "1"}
                  onCheckedChange={(v) => setPlanData((prev: any) => ({ ...prev, [key]: v ? 1 : 0 }))}
                />
              </div>
            );
          }

          if (typeof value === "object" && value !== null) {
            return (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-semibold">{displayLabel}</Label>
                <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto max-h-32">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            );
          }

          return (
            <div key={key} className="space-y-2">
              <Label className="text-sm">{displayLabel}</Label>
              <Input
                value={String(value ?? "")}
                onChange={(e) => setPlanData((prev: any) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">MLM Plans</h1>
          <p className="text-muted-foreground">
            Configure compensation plan settings
          </p>
        </div>
        <Button variant="outline" onClick={loadPlanLabels}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Compensation Plans</TabsTrigger>
          <TabsTrigger value="currencies">Currencies</TabsTrigger>
          <TabsTrigger value="memberships">Memberships</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Code</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PLAN_CODES.map((plan) => {
                      const label = planLabels[plan.code] || plan.label;
                      return (
                        <TableRow key={plan.code}>
                          <TableCell className="font-mono text-sm">{plan.code}</TableCell>
                          <TableCell className="font-medium">{label}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-100">
                              Configured
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openPlanDetail(plan)}>
                              <Settings className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currencies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Currency Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency Code</TableHead>
                    <TableHead>Currency Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Exchange Rate</TableHead>
                    <TableHead>Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.length > 0 ? currencies.map((c: any) => (
                    <TableRow key={c.id || c.currency_id}>
                      <TableCell className="font-mono">{c.currency_code || c.code || "—"}</TableCell>
                      <TableCell>{c.currency_name || c.name || "—"}</TableCell>
                      <TableCell>{c.currency_symbol || c.symbol || "—"}</TableCell>
                      <TableCell>{c.exchange_rate || c.rate || "—"}</TableCell>
                      <TableCell>
                        {(c.is_default === 1 || c.is_default === "1") && (
                          <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No currencies configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memberships" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Membership Types</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberships.length > 0 ? memberships.map((m: any) => (
                    <TableRow key={m.id || m.membership_id}>
                      <TableCell className="font-medium">{m.membership_name || m.name || "—"}</TableCell>
                      <TableCell>₱{m.membership_price || m.price || "0"}</TableCell>
                      <TableCell>
                        <Badge className={m.membership_archived === 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {m.membership_archived === 0 ? "Active" : "Archived"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                        No memberships configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Detail / Config Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              {selectedPlan?.label || selectedPlan?.code} — Configuration
            </DialogTitle>
          </DialogHeader>

          {planDataLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : planData ? (
            renderPlanFields()
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No configuration data available for this plan
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePlan} disabled={saving || planDataLoading}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
