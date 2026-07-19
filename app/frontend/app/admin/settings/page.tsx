"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Settings,
  UserPlus,
  Layers,
  Key,
  ShoppingBag,
  Vault,
  Zap,
  ArrowUpFromLine,
  Building2,
  Receipt,
  Gift,
  Truck,
  Lock,
  List,
  Hash,
  DollarSign,
  Trophy,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SettingsCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  loadEndpoint: string;
  updateEndpoint: string;
}

const SETTINGS_CATEGORIES: SettingsCategory[] = [
  { key: "registration", label: "Registration", icon: <UserPlus className="h-6 w-6" />, loadEndpoint: "/api/settings/registration", updateEndpoint: "/api/settings/registration_update" },
  { key: "slot", label: "Slot Settings", icon: <Layers className="h-6 w-6" />, loadEndpoint: "/api/settings/slot", updateEndpoint: "/api/settings/slot_update" },
  { key: "codeactivate", label: "Code Activation", icon: <Key className="h-6 w-6" />, loadEndpoint: "/api/settings/codeactivate", updateEndpoint: "/api/settings/codeactivate_update" },
  { key: "retailer", label: "Retailer", icon: <ShoppingBag className="h-6 w-6" />, loadEndpoint: "/api/settings/retailer", updateEndpoint: "/api/settings/retailer_update" },
  { key: "codevault", label: "Code Vault", icon: <Vault className="h-6 w-6" />, loadEndpoint: "/api/settings/codevault", updateEndpoint: "/api/settings/codevault_update" },
  { key: "eloading", label: "Eloading", icon: <Zap className="h-6 w-6" />, loadEndpoint: "/api/eloading/get_settings", updateEndpoint: "/api/eloading/get_settings" },
  { key: "payout", label: "Payout", icon: <ArrowUpFromLine className="h-6 w-6" />, loadEndpoint: "/api/cashout/get_settings", updateEndpoint: "/api/cashout/update_settings" },
  { key: "company", label: "Company Info", icon: <Building2 className="h-6 w-6" />, loadEndpoint: "/api/branch/cashier/load_company_info", updateEndpoint: "/api/branch/cashier/save_company_info" },
  { key: "receipt", label: "Receipt CMS", icon: <Receipt className="h-6 w-6" />, loadEndpoint: "/api/settings/load_receipt_info", updateEndpoint: "/api/settings/edit_receipt_info" },
  { key: "cashierbonus", label: "Cashier Bonus", icon: <Gift className="h-6 w-6" />, loadEndpoint: "/api/settings/load_cashier_bonus", updateEndpoint: "/api/settings/manage_cashier_bonus" },
  { key: "shipping", label: "Shipping Fee", icon: <Truck className="h-6 w-6" />, loadEndpoint: "/api/settings/load_shipping_info", updateEndpoint: "/api/settings/manage_shipping_fee" },
  { key: "lockdown", label: "Lockdown AutoShip", icon: <Lock className="h-6 w-6" />, loadEndpoint: "/api/settings/lockdown_settings", updateEndpoint: "/api/settings/lockdown_settings_update" },
  { key: "breakdown", label: "Breakdown Items", icon: <List className="h-6 w-6" />, loadEndpoint: "/api/settings/load_breakdown_items", updateEndpoint: "/api/settings/update_breakdown_items" },
  { key: "tin", label: "TIN", icon: <Hash className="h-6 w-6" />, loadEndpoint: "/api/settings/load_tin_settings", updateEndpoint: "/api/settings/update_tin_settings" },
  { key: "incomelimit", label: "Income Limit", icon: <DollarSign className="h-6 w-6" />, loadEndpoint: "/api/settings/load_income_limit_settings", updateEndpoint: "/api/settings/update_income_limit_settings" },
  { key: "leaderboard", label: "LeaderBoard", icon: <Trophy className="h-6 w-6" />, loadEndpoint: "/api/settings/load_leaderboard", updateEndpoint: "/api/settings/update_leaderboard" },
];

// Define which fields are numeric vs checkbox for known settings
const NUMERIC_FIELDS = [
  "max_slot_transfer", "default_slot_limit", "default_added_days",
  "max_retail_limit", "dealers_bonus",
  "additional_to_wallet", "discount_to_wallet",
  "convenience_fee", "income_limit",
  "shipping_starting_amount", "shipping_increment", "shipping_amount_per_increment",
  "days_before_autoship",
  "total_buy_amount", "amount_given",
];

const DROPDOWN_FIELDS: Record<string, { options: { value: string; label: string }[] }> = {
  mode: { options: [{ value: "test", label: "Test" }, { value: "production", label: "Production" }] },
  cycle: { options: [{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }, { value: "lifetime", label: "Lifetime" }] },
  status: { options: [{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" }] },
};

export default function AdminSettingsPage() {
  const { token } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SettingsCategory | null>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Seed settings on mount
  useEffect(() => {
    if (token) {
      apiPost("/api/settings/seed", {}, token).catch(() => {});
    }
  }, [token]);

  const openCategory = async (cat: SettingsCategory) => {
    setActiveCategory(cat);
    setSettingsOpen(true);
    setLoading(true);
    try {
      const body: any = cat.key === "eloading" ? { settings: "get" } : {};
      const res = await apiPost<any>(cat.loadEndpoint, body, token);
      setSettingsData(res);
    } catch {
      setSettingsData(null);
      toast.error("Failed to load settings");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!activeCategory || !token) return;
    setSaving(true);
    try {
      const body = activeCategory.key === "eloading"
        ? { settings: "update", ...settingsData }
        : settingsData;
      await apiPost(activeCategory.updateEndpoint, body, token);
      toast.success("Settings saved");
      setSettingsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    }
    setSaving(false);
  };

  const updateField = (key: string, value: any) => {
    setSettingsData((prev: any) => ({ ...prev, [key]: value }));
  };

  const isNumericField = (key: string) =>
    NUMERIC_FIELDS.some((f) => key.toLowerCase().includes(f.toLowerCase()));

  const isDropdownField = (key: string) =>
    Object.keys(DROPDOWN_FIELDS).includes(key);

  const renderSettingsFields = () => {
    if (!settingsData) return null;

    // If it's an array, render as list
    if (Array.isArray(settingsData)) {
      return (
        <div className="space-y-3">
          {settingsData.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between border-b pb-2">
              <Label className="text-sm">{item.label || item.name || item.key || `Item ${i + 1}`}</Label>
              {typeof item.value === "boolean" || item.value === 0 || item.value === 1 ? (
                <Checkbox
                  checked={!!item.value}
                  onCheckedChange={(v) => {
                    const updated = [...settingsData];
                    updated[i] = { ...item, value: v ? 1 : 0 };
                    setSettingsData(updated);
                  }}
                />
              ) : (
                <Input
                  className="w-32"
                  value={item.value || ""}
                  onChange={(e) => {
                    const updated = [...settingsData];
                    updated[i] = { ...item, value: e.target.value };
                    setSettingsData(updated);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    // Object: render key-value pairs
    const entries = Object.entries(settingsData).filter(
      ([key]) => !["id", "created_at", "updated_at"].includes(key)
    );

    return (
      <div className="space-y-4">
        {entries.map(([key, value]) => {
          const displayLabel = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

          if (isDropdownField(key)) {
            return (
              <div key={key} className="space-y-2">
                <Label className="text-sm">{displayLabel}</Label>
                <Select value={String(value ?? "")} onValueChange={(v) => updateField(key, v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DROPDOWN_FIELDS[key].options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          if (isNumericField(key)) {
            return (
              <div key={key} className="space-y-2">
                <Label className="text-sm">{displayLabel}</Label>
                <Input
                  type="number"
                  value={value as string || ""}
                  onChange={(e) => updateField(key, e.target.value)}
                />
              </div>
            );
          }

          // Boolean/checkbox
          if (value === true || value === false || value === 0 || value === 1 || value === "0" || value === "1") {
            return (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm">{displayLabel}</Label>
                <Switch
                  checked={value === true || value === 1 || value === "1"}
                  onCheckedChange={(v) => updateField(key, v ? 1 : 0)}
                />
              </div>
            );
          }

          // Text input
          return (
            <div key={key} className="space-y-2">
              <Label className="text-sm">{displayLabel}</Label>
              <Input
                value={String(value ?? "")}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage system configuration and settings</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SETTINGS_CATEGORIES.map((cat) => (
          <Card
            key={cat.key}
            className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
            onClick={() => openCategory(cat)}
          >
            <CardContent className="pt-6 flex flex-col items-center gap-3">
              <div className="text-blue-600">{cat.icon}</div>
              <p className="font-medium text-sm text-center">{cat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {activeCategory?.label} Settings
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : settingsData ? (
            renderSettingsFields()
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No settings data available
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
