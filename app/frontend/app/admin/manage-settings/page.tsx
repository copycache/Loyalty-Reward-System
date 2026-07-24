"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Settings, Building2, Receipt, DollarSign, Truck, Fingerprint, CheckCircle, Loader2 } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminManageSettingsPage() {
  const { token } = useAuthStore();
  const [submitted, setSubmitted] = useState(false);

  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [cashoutSettings, setCashoutSettings] = useState<any>(null);
  const [receiptInfo, setReceiptInfo] = useState<any>(null);
  const [cashierBonus, setCashierBonus] = useState<any>({});
  const [shippingFee, setShippingFee] = useState<any>(null);
  const [tinSettings, setTinSettings] = useState<any>(null);

  const [companyOpen, setCompanyOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [cashierBonusOpen, setCashierBonusOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [tinOpen, setTinOpen] = useState(false);

  const loadCompanyInfo = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/branch/cashier/load_company_info", {}, token);
      setCompanyInfo(res);
    } catch { /* ignore */ }
  }, [token]);

  const loadCashoutSettings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/cashout/get_settings", {}, token);
      setCashoutSettings(res);
    } catch { /* ignore */ }
  }, [token]);

  const loadReceiptInfo = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/settings/load_receipt_info", {}, token);
      setReceiptInfo(res || {});
    } catch { /* ignore */ }
  }, [token]);

  const loadCashierBonus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/settings/load_cashier_bonus", {}, token);
      setCashierBonus(res || {});
    } catch { /* ignore */ }
  }, [token]);

  const loadShippingInfo = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/settings/load_shipping_info", {}, token);
      setShippingFee(res);
    } catch { /* ignore */ }
  }, [token]);

  const loadTinSettings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/settings/load_tin_settings", {}, token);
      setTinSettings(res || {});
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    loadCompanyInfo();
    loadCashoutSettings();
  }, []);

  const editCompanyInfoSubmit = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/branch/cashier/save_company_info", companyInfo, token);
      toast.success("Company info updated");
      setSubmitted(false);
    } catch { toast.error("Failed"); setSubmitted(false); }
  };

  const updateCashoutSettings = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/cashout/update_settings", cashoutSettings, token);
      toast.success("Payout settings updated");
      setCashoutSettings(await apiPost<any>("/api/cashout/get_settings", {}, token));
      setSubmitted(false);
    } catch { toast.error("Failed"); setSubmitted(false); }
  };

  const inputRadio = (ref: string, value: number) => {
    setCashoutSettings((prev: any) => {
      if (!prev) return prev;
      if (ref === "date") return { ...prev, cash_out_settings_per_day: value, cash_out_settings_per_date: value === 0 ? 1 : 0 };
      return { ...prev, cash_out_settings_per_date: value, cash_out_settings_per_day: value === 0 ? 1 : 0 };
    });
  };

  const inputCheck = (ref: string, value: number, key: number) => {
    setCashoutSettings((prev: any) => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (ref === "day" && updated.per_day) {
        const perDay = [...updated.per_day];
        perDay[key] = { ...perDay[key], day_archived: value };
        updated.per_day = perDay;
      } else if (updated.per_date) {
        const perDate = [...updated.per_date];
        perDate[key] = { ...perDate[key], date_archived: value };
        updated.per_date = perDate;
      }
      return updated;
    });
  };

  const editReceiptInfo = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/settings/edit_receipt_info", receiptInfo, token);
      toast.success("Receipt info updated");
      setSubmitted(false);
    } catch { toast.error("Failed"); setSubmitted(false); }
  };

  const addCashierBonus = (index: number) => {
    setCashierBonus((prev: any) => {
      const bonus = [...(prev.cashier_bonus || [])];
      bonus[index + 1] = { cashier_bonus_id: null, cashier_bonus_buy_amount: null, cashier_bonus_given_amount: null, archive: 0 };
      return { ...prev, cashier_bonus: bonus };
    });
  };

  const removeCashierBonus = (index: number) => {
    setCashierBonus((prev: any) => {
      const bonus = [...(prev.cashier_bonus || [])];
      if (bonus[index]) bonus[index] = { ...bonus[index], archive: 1 };
      return { ...prev, cashier_bonus: bonus };
    });
  };

  const manageCashierBonus = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/settings/manage_cashier_bonus", cashierBonus, token);
      toast.success("Cashier bonus updated");
      const res = await apiPost<any>("/api/settings/load_cashier_bonus", {}, token);
      setCashierBonus(res || {});
      setSubmitted(false);
    } catch { toast.error("Failed"); setSubmitted(false); }
  };

  const manageShippingFee = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/settings/manage_shipping_fee", shippingFee, token);
      toast.success("Shipping fee updated");
      const res = await apiPost<any>("/api/settings/load_shipping_info", {}, token);
      setShippingFee(res);
      setSubmitted(false);
    } catch { toast.error("Failed"); setSubmitted(false); }
  };

  const updateTinSettings = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/settings/update_tin_settings", tinSettings, token);
      toast.success("TIN settings updated");
      const res = await apiPost<any>("/api/settings/load_tin_settings", {}, token);
      setTinSettings(res || {});
      setSubmitted(false);
    } catch { toast.error("Failed"); setSubmitted(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Manage system configuration</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-6 border rounded-lg space-y-3">
              <DollarSign className="h-8 w-8 mx-auto text-muted-foreground" />
              <h4 className="font-semibold">Payout Settings</h4>
              <Button variant="outline" size="sm" onClick={() => { loadCashoutSettings(); setPayoutOpen(true); }}>
                <Settings className="h-4 w-4 mr-2" /> Manage
              </Button>
            </div>
            <div className="text-center p-6 border rounded-lg space-y-3">
              <Building2 className="h-8 w-8 mx-auto text-muted-foreground" />
              <h4 className="font-semibold">Company Info Settings</h4>
              <Button variant="outline" size="sm" onClick={() => setCompanyOpen(true)}>
                <Settings className="h-4 w-4 mr-2" /> Manage
              </Button>
            </div>
            <div className="text-center p-6 border rounded-lg space-y-3">
              <Receipt className="h-8 w-8 mx-auto text-muted-foreground" />
              <h4 className="font-semibold">Receipt CMS</h4>
              <Button variant="outline" size="sm" onClick={() => { loadReceiptInfo(); setReceiptOpen(true); }}>
                <Settings className="h-4 w-4 mr-2" /> Manage
              </Button>
            </div>
            <div className="text-center p-6 border rounded-lg space-y-3">
              <DollarSign className="h-8 w-8 mx-auto text-muted-foreground" />
              <h4 className="font-semibold">Cashier Bonus</h4>
              <Button variant="outline" size="sm" onClick={() => { loadCashierBonus(); setCashierBonusOpen(true); }}>
                <Settings className="h-4 w-4 mr-2" /> Manage
              </Button>
            </div>
            <div className="text-center p-6 border rounded-lg space-y-3">
              <Truck className="h-8 w-8 mx-auto text-muted-foreground" />
              <h4 className="font-semibold">Shipping Fee</h4>
              <Button variant="outline" size="sm" onClick={() => { loadShippingInfo(); setShippingOpen(true); }}>
                <Settings className="h-4 w-4 mr-2" /> Manage
              </Button>
            </div>
            <div className="text-center p-6 border rounded-lg space-y-3">
              <Fingerprint className="h-8 w-8 mx-auto text-muted-foreground" />
              <h4 className="font-semibold">TIN Settings</h4>
              <Button variant="outline" size="sm" onClick={() => { loadTinSettings(); setTinOpen(true); }}>
                <Settings className="h-4 w-4 mr-2" /> Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Info Modal */}
      <Dialog open={companyOpen} onOpenChange={setCompanyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><Building2 className="h-5 w-5 inline mr-2" />Company Info</DialogTitle>
          </DialogHeader>
          <div className="group-title font-semibold mb-4">Edit Company Info</div>
          {companyInfo && (
            <div className="space-y-3">
              {[
                { label: "Company Name", key: "company_name" },
                { label: "Street Address", key: "street" },
                { label: "City", key: "city" },
                { label: "State/Province", key: "state" },
                { label: "Contact Number", key: "contact_number" },
                { label: "Contact Email", key: "contact_email", type: "email" },
              ].map((f) => (
                <div key={f.key} className="grid grid-cols-2 items-center gap-4">
                  <Label className="text-center">{f.label}</Label>
                  <Input
                    type={f.type || "text"}
                    value={companyInfo[f.key] || ""}
                    onChange={(e) => setCompanyInfo((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompanyOpen(false)}>Close</Button>
            <Button onClick={editCompanyInfoSubmit} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating</> : <><CheckCircle className="h-4 w-4 mr-2" /> Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Settings Modal */}
      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><DollarSign className="h-5 w-5 inline mr-2" />Payout Settings</DialogTitle>
          </DialogHeader>
          {cashoutSettings && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-2">
                  <Label>Payout Per Day</Label>
                  <input
                    type="radio" name="payout_mode"
                    checked={cashoutSettings.cash_out_settings_per_day === 0}
                    onChange={() => inputRadio("day", 0)}
                    className="block mx-auto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payout Per Date</Label>
                  <input
                    type="radio" name="payout_mode"
                    checked={cashoutSettings.cash_out_settings_per_date === 0}
                    onChange={() => inputRadio("date", 0)}
                    className="block mx-auto"
                  />
                </div>
              </div>
              {cashoutSettings.cash_out_settings_per_day === 0 && cashoutSettings.per_day && (
                <div>
                  <Label className="block text-center mb-2">Payout Per Day</Label>
                  <div className="space-y-2">
                    {cashoutSettings.per_day.map((data: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input disabled value={data.cash_out_settings_day || ""} />
                        <input
                          type="checkbox"
                          checked={data.day_archived === 0}
                          onChange={() => inputCheck("day", data.day_archived === 0 ? 1 : 0, i)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {cashoutSettings.cash_out_settings_per_date === 0 && cashoutSettings.per_date && (
                <div>
                  <Label className="block text-center mb-2">Payout Per Date</Label>
                  <div className="space-y-2">
                    {cashoutSettings.per_date.filter((d: any) => d.archive !== 1).map((data: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input disabled value={data.cash_out_settings_date || ""} />
                        <input
                          type="checkbox"
                          checked={data.date_archived === 0}
                          onChange={() => inputCheck("date", data.date_archived === 0 ? 1 : 0, i)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutOpen(false)}>Close</Button>
            <Button onClick={updateCashoutSettings} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating</> : <><CheckCircle className="h-4 w-4 mr-2" /> Update Settings</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt CMS Modal */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><Receipt className="h-5 w-5 inline mr-2" />Receipt Info</DialogTitle>
          </DialogHeader>
          <div className="group-title font-semibold mb-4">Edit Receipt Info</div>
          {receiptInfo && (
            <div className="space-y-3">
              {[
                { label: "Receipt Title", key: "title" },
                { label: "VAT Reg. TIN", key: "tin" },
                { label: "Invoice Details", key: "details" },
                { label: "Disclaimer Message", key: "disclaimer" },
              ].map((f) => (
                <div key={f.key} className="grid grid-cols-2 items-center gap-4">
                  <Label className="text-center">{f.label}</Label>
                  <Input value={receiptInfo[f.key] || ""} onChange={(e) => setReceiptInfo((prev: any) => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="grid grid-cols-2 items-center gap-4">
                <Label className="text-center">Claim Code On Receipt</Label>
                <select className="h-10 rounded-md border px-3 text-sm" value={receiptInfo.claim_code ?? "1"} onChange={(e) => setReceiptInfo((prev: any) => ({ ...prev, claim_code: e.target.value }))}>
                  <option value="1">Show</option>
                  <option value="0">Hide</option>
                </select>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label className="text-center">Payment Type Used</Label>
                <select className="h-10 rounded-md border px-3 text-sm" value={receiptInfo.payment_type ?? "1"} onChange={(e) => setReceiptInfo((prev: any) => ({ ...prev, payment_type: e.target.value }))}>
                  <option value="1">Show</option>
                  <option value="0">Hide</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptOpen(false)}>Close</Button>
            <Button onClick={editReceiptInfo} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating</> : <><CheckCircle className="h-4 w-4 mr-2" /> Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cashier Bonus Modal */}
      <Dialog open={cashierBonusOpen} onOpenChange={setCashierBonusOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><DollarSign className="h-5 w-5 inline mr-2" />Cashier Info</DialogTitle>
          </DialogHeader>
          <div className="group-title font-semibold mb-4">Manage Direct Bonus</div>
          {cashierBonus.cashier_bonus_settings && (
            <div className="space-y-4">
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={cashierBonus.cashier_bonus_settings.cashier_bonus_enable ?? "1"} onChange={(e) => setCashierBonus((prev: any) => ({ ...prev, cashier_bonus_settings: { ...prev.cashier_bonus_settings, cashier_bonus_enable: e.target.value } }))}>
                <option value="1">Enable</option>
                <option value="0">Disable</option>
              </select>
              <div>
                <div className="grid grid-cols-[1fr_1fr_40px] gap-2 font-semibold text-sm mb-2">
                  <span className="text-center">Total Buy Amount (Cashier Only)</span>
                  <span className="text-center">Amount Given</span>
                  <span></span>
                </div>
                {(cashierBonus.cashier_bonus || []).filter((d: any) => d.archive !== 1).map((data: any, i: number) => {
                  const isLast = i === (cashierBonus.cashier_bonus || []).filter((d: any) => d.archive !== 1).length - 1;
                  return (
                    <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2 items-center">
                      <Input type="number" value={data.cashier_bonus_buy_amount ?? ""} onChange={(e) => { const bonus = [...(cashierBonus.cashier_bonus || [])]; bonus[i] = { ...bonus[i], cashier_bonus_buy_amount: e.target.value }; setCashierBonus((prev: any) => ({ ...prev, cashier_bonus: bonus })); }} />
                      <Input type="number" value={data.cashier_bonus_given_amount ?? ""} onChange={(e) => { const bonus = [...(cashierBonus.cashier_bonus || [])]; bonus[i] = { ...bonus[i], cashier_bonus_given_amount: e.target.value }; setCashierBonus((prev: any) => ({ ...prev, cashier_bonus: bonus })); }} />
                      <button type="button" onClick={() => isLast ? addCashierBonus(i) : removeCashierBonus(i)} className={`text-center text-lg ${isLast ? "text-blue-500" : "text-red-500"}`}>
                        {isLast ? "+" : "×"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCashierBonusOpen(false)}>Close</Button>
            <Button onClick={manageCashierBonus} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating</> : <><CheckCircle className="h-4 w-4 mr-2" /> Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipping Fee Modal */}
      <Dialog open={shippingOpen} onOpenChange={setShippingOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><Truck className="h-5 w-5 inline mr-2" />Shipping Info</DialogTitle>
          </DialogHeader>
          <div className="group-title font-semibold mb-4">Manage Direct Bonus</div>
          {shippingFee && (
            <div className="space-y-4">
              {[
                { label: "Shipping Matrix Starting Amount", key: "shipping_fee_matrix_start_amount" },
                { label: "Shipping Matrix Increment (No. of Packages)", key: "shipping_fee_increment" },
                { label: "Shipping Matrix Amount per Increment (Additional Fee Added)", key: "shipping_fee_increment_amount" },
              ].map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-sm">{f.label}</Label>
                  <Input type="number" value={shippingFee[f.key] ?? ""} onChange={(e) => setShippingFee((prev: any) => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingOpen(false)}>Close</Button>
            <Button onClick={manageShippingFee} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating</> : <><CheckCircle className="h-4 w-4 mr-2" /> Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TIN Settings Modal */}
      <Dialog open={tinOpen} onOpenChange={setTinOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle><Fingerprint className="h-5 w-5 inline mr-2" />Setting</DialogTitle>
          </DialogHeader>
          <div className="group-title font-semibold mb-4">TIN Setting</div>
          {tinSettings && (
            <div className="flex items-center justify-between">
              <Label>TIN</Label>
              <input
                type="checkbox"
                checked={tinSettings.tin_settings === 1 || tinSettings.tin_settings === "1"}
                onChange={(e) => setTinSettings((prev: any) => ({ ...prev, tin_settings: e.target.checked ? 1 : 0 }))}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTinOpen(false)}>Close</Button>
            <Button onClick={updateTinSettings} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating</> : <><CheckCircle className="h-4 w-4 mr-2" /> Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
