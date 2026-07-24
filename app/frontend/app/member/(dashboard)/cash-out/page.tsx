"use client";

import { useEffect, useState, useCallback } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Loader2, Wallet, ArrowDownToLine, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, MapPin,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface CashOutMethod {
  cash_out_method_id: number;
  cash_out_method_name: string;
  cash_out_method_category: string;
  cash_out_method_fee: number;
  cash_out_method_withholding_tax: number;
  cash_out_method_service_charge: number;
  cash_out_method_service_charge_type: string;
  cash_out_method_charge_to: string;
  cash_out_method_currency: string;
  cash_limit: number;
  minimum_payout: number;
  initial_payout: number;
  product_charge: number;
  survey_charge: number;
  gc_charge: number;
  [key: string]: any;
}

interface SlotWallet {
  slot_id: number;
  slot_no: string;
  wallet_amount: number;
  initial_payout: number;
  [key: string]: any;
}

interface PendingTransaction {
  cash_out_id: number;
  cash_out_amount: number;
  cash_out_status: string;
  cash_out_method_name: string;
  created_at: string;
  [key: string]: any;
}

interface Address {
  id?: number;
  address_id?: number;
  additional_info: string;
  barangay_city: string;
  region_province: string;
  is_default: number;
  [key: string]: any;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function MemberCashoutPage() {
  const { token, currentSlot } = useAuthStore();
  const slotId = currentSlot?.slot_id;

  // ---------- Loading ----------
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ---------- Methods ----------
  const [methods, setMethods] = useState<CashOutMethod[]>([]);
  const [activeMethod, setActiveMethod] = useState<CashOutMethod | null>(null);

  // ---------- Pending check ----------
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);

  // ---------- Wallet ----------
  const [slotWallet, setSlotWallet] = useState<number>(0);
  const [allSlots, setAllSlots] = useState<SlotWallet[]>([]);

  // ---------- Cash out form ----------
  const [cashOutAmount, setCashOutAmount] = useState<number>(0);
  const [cashOutType, setCashOutType] = useState("all_slot");
  const [primaryInfo, setPrimaryInfo] = useState("");
  const [secondaryInfo, setSecondaryInfo] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [optionalInfo, setOptionalInfo] = useState<string | null>(null);

  // ---------- Charges ----------
  const [totalCharge, setTotalCharge] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [expectedReceivable, setExpectedReceivable] = useState(0);
  const [fixCharge, setFixCharge] = useState(0);
  const [taxCharge, setTaxCharge] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [gcCharge, setGcCharge] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // ---------- Addresses ----------
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddresses, setShowAddresses] = useState(false);

  // ---------- TIN ----------
  const [userInfo, setUserInfo] = useState<any>(null);
  const [tinDialogOpen, setTinDialogOpen] = useState(false);
  const [tinMode, setTinMode] = useState<"add" | "edit">("add");
  const [tinValue, setTinValue] = useState("");
  const [tinPassword, setTinPassword] = useState("");
  const [tinSubmitting, setTinSubmitting] = useState(false);

  // ---------- Initial payout ----------
  const [isInitial, setIsInitial] = useState(false);

  // ---------- Transaction history ----------
  const [allTransactions, setAllTransactions] = useState<PendingTransaction[]>([]);

  /* ================================================================ */
  /*  Data fetching                                                    */
  /* ================================================================ */

  const loadAll = useCallback(async () => {
    if (!token || !slotId) return;
    setLoading(true);
    try {
      const [userInfoRes, addressRes, methodRes, pendingRes, allTxRes] = await Promise.all([
        apiPost<any>("/api/settings/get_user_info", {}, token).catch(() => null),
        apiPost<any>("/api/settings/get_addresses", {}, token).catch(() => null),
        apiPost<any>("/api/cashout/get_method_list", {}, token).catch(() => null),
        apiPost<any>("/api/cashout/get_transactions", { cash_out_status: "pending/processing", slot_id: slotId }, token).catch(() => null),
        apiPost<any>("/api/cashout/get_transactions", { cash_out_status: "all", slot_id: slotId }, token).catch(() => null),
      ]);

      if (userInfoRes) setUserInfo(userInfoRes);
      if (Array.isArray(addressRes)) setAddresses(addressRes);
      if (Array.isArray(methodRes)) setMethods(methodRes);
      if (Array.isArray(pendingRes)) setPendingTransactions(pendingRes);
      if (Array.isArray(allTxRes)) setAllTransactions(allTxRes);

      // Auto-select method
      if (Array.isArray(methodRes) && methodRes.length > 0) {
        let defaultMethod: CashOutMethod | null = null;
        if (Array.isArray(allTxRes) && allTxRes.length > 0) {
          const lastTx = allTxRes[allTxRes.length - 1];
          defaultMethod = methodRes.find((m: CashOutMethod) => m.cash_out_method_id === lastTx.cash_out_method_id) || null;
        }
        if (!defaultMethod) defaultMethod = methodRes[0];
        if (defaultMethod) selectMethod(defaultMethod, addressRes);
      }
    } catch { /* ignore */ }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, slotId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const selectMethod = async (method: CashOutMethod, addrs?: Address[] | null) => {
    setActiveMethod(method);
    setCashOutAmount(0);
    setPrimaryInfo(String(currentSlot?.name || ""));
    setEmailAddress(String(currentSlot?.email || ""));
    setContactNumber(String(currentSlot?.contact || ""));
    setSecondaryInfo("");
    setOptionalInfo(method.cash_out_method_category === "bank" ? "Savings" : null);

    // Load wallet for this method's currency
    try {
      const walletRes = await apiPost<any>("/api/cashout/get_slot_wallet", {
        slot_id: slotId,
        currency: method.cash_out_method_currency,
        data: method,
      }, token);
      if (walletRes) {
        setSlotWallet(walletRes.total || 0);
        setAllSlots(walletRes.slots || []);
      }
    } catch { /* ignore */ }

    // Check initial payout
    try {
      const initRes = await apiPost("/api/cashout/check_if_initial_payout", {
        slot_id: slotId,
        currency: method.cash_out_method_currency,
      }, token);
      setIsInitial(!!initRes);
    } catch { /* ignore */ }

    // Set default address for remittance
    if (method.cash_out_method_category === "remittance") {
      const addrList = addrs || addresses;
      if (Array.isArray(addrList)) {
        const defaultAddr = addrList.find((a: Address) => a.is_default === 1);
        if (defaultAddr) {
          setSecondaryInfo([defaultAddr.additional_info, defaultAddr.barangay_city, defaultAddr.region_province].filter(Boolean).join(", "));
        }
      }
    }

    computeCharges(0, method);
  };

  /* ================================================================ */
  /*  Charge computation                                               */
  /* ================================================================ */

  const computeCharges = (amount: number, method?: CashOutMethod) => {
    const m = method || activeMethod;
    if (!m) return;

    let tc = 0;
    let tax = 0;
    let svc = 0;
    let fix = m.cash_out_method_fee || 0;
    let gc = ((m.gc_charge || 0) / 100) * amount;

    // Withholding tax (percentage)
    if (m.cash_out_method_withholding_tax > 0) {
      tax = (m.cash_out_method_withholding_tax / 100) * amount;
      tc += tax;
    }

    // Service charge
    if (m.cash_out_method_service_charge > 0) {
      if (m.cash_out_method_service_charge_type === "percentage") {
        svc = (m.cash_out_method_service_charge / 100) * (amount - tc);
      } else {
        svc = m.cash_out_method_service_charge;
      }
      tc += svc;
    }

    // Fixed charge + gc + product charge
    tc += fix;
    tc += gc;
    tc += (m.product_charge || 0);

    // Survey charge for initial payout
    let surveyCharge = 0;
    if (isInitial && m.survey_charge) {
      surveyCharge = m.survey_charge;
      tc += surveyCharge;
    }

    let due = 0;
    let receivable = 0;
    if (m.cash_out_method_charge_to === "inclusive") {
      due = amount;
      receivable = amount - tc;
    } else {
      due = amount + tc;
      receivable = amount;
    }

    setTotalCharge(tc);
    setFixCharge(fix);
    setTaxCharge(tax);
    setServiceCharge(svc);
    setGcCharge(gc);
    setTotalDue(due);
    setExpectedReceivable(receivable);
  };

  /* ================================================================ */
  /*  Submit cash out                                                  */
  /* ================================================================ */

  const handleSubmit = async () => {
    if (!activeMethod) return;
    setSubmitting(true);

    // Validations
    if (expectedReceivable < 0) {
      toast.error("Invalid transaction due to negative amount.");
      setSubmitting(false); return;
    }
    if (cashOutAmount <= 0) {
      toast.error("Cash out amount must be greater than 0.");
      setSubmitting(false); return;
    }
    if (activeMethod.cash_limit && activeMethod.cash_limit < cashOutAmount) {
      toast.error("You exceeded the encashment amount limit.");
      setSubmitting(false); return;
    }
    if (!primaryInfo.trim()) {
      toast.error("Please provide full name / account name.");
      setSubmitting(false); return;
    }
    if (!secondaryInfo.trim() && activeMethod.cash_out_method_category !== "remittance") {
      toast.error("Please provide address / account number.");
      setSubmitting(false); return;
    }
    if (!emailAddress.trim()) {
      toast.error("Please provide email address.");
      setSubmitting(false); return;
    }
    if (!contactNumber.trim()) {
      toast.error("Please provide contact number.");
      setSubmitting(false); return;
    }

    try {
      const res = await apiPost<any>("/api/cashout/record_cash_out", {
        slot_id: slotId,
        cash_out_amount: cashOutAmount,
        total_due: totalDue,
        expected_receivable: expectedReceivable,
        service_charge: serviceCharge,
        cash_out_method_method_fee: fixCharge,
        cash_out_method_withholding_tax: taxCharge,
        cash_out_method_id: activeMethod.cash_out_method_id,
        cash_out_method_currency: activeMethod.cash_out_method_currency,
        cash_out_method_category: activeMethod.cash_out_method_category,
        cash_out_primary_info: primaryInfo,
        cash_out_secondary_info: secondaryInfo,
        cash_out_email_address: emailAddress,
        cash_out_contact_number: contactNumber,
        cash_out_optional_info: optionalInfo,
        savings_amount: 0,
        product_charge: activeMethod.product_charge,
        survey_charge: isInitial ? activeMethod.survey_charge : 0,
        gc_charge: gcCharge,
        all_slot: allSlots,
        type: cashOutType,
        edited: false,
      }, token);

      if (res?.status === "success") {
        toast.success(res.status_message || "Cash out request submitted!");
        loadAll();
      } else if (res?.status === "warning") {
        if (res.ref === "add") {
          setTinMode("add"); setTinValue(""); setTinPassword(""); setTinDialogOpen(true);
        } else {
          setTinMode("edit"); setTinValue(userInfo?.tin || ""); setTinPassword(""); setTinDialogOpen(true);
        }
      } else if (res?.status === "existing") {
        toast.error(res.status_message || "Already exists.");
      } else {
        const msgs = res?.status_message;
        if (Array.isArray(msgs)) msgs.forEach((m: string) => toast.error(m));
        else toast.error(msgs || "Cash out failed.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Cash out failed.");
    }
    setSubmitting(false);
  };

  /* ================================================================ */
  /*  TIN submit                                                       */
  /* ================================================================ */

  const submitTin = async () => {
    setTinSubmitting(true);
    const endpoint = tinMode === "add" ? "/api/settings/add_tin" : "/api/settings/edit_tin";
    const payload = tinMode === "add"
      ? { add_tin: tinValue, password_confirm_add: tinPassword }
      : { edit_tin: tinValue, password_confirm_edit: tinPassword };

    try {
      const res = await apiPost<any>(endpoint, payload, token);
      if (res?.status === "success") {
        toast.success(res.message || "TIN updated!");
        setTinDialogOpen(false);
        // Refresh user info
        const info = await apiPost<any>("/api/settings/get_user_info", {}, token);
        if (info) setUserInfo(info);
      } else {
        const msgs = res?.message || res?.status_message;
        if (Array.isArray(msgs)) msgs.forEach((m: string) => toast.error(m));
        else toast.error(msgs || "Failed to update TIN.");
      }
    } catch { toast.error("Failed to update TIN."); }
    setTinSubmitting(false);
  };

  /* ================================================================ */
  /*  Helpers                                                          */
  /* ================================================================ */

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: activeMethod?.cash_out_method_currency || "PHP" }).format(amount);

  const hasPending = pendingTransactions.length > 0;

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ArrowDownToLine className="h-6 w-6" /> Cash Out
      </h1>

      {/* Pending transactions warning */}
      {hasPending && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  You have pending cash out request(s)
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Please wait for your current request to be processed before submitting a new one.
                </p>
                <div className="mt-3 space-y-2">
                  {pendingTransactions.map((tx) => (
                    <div key={tx.cash_out_id} className="flex items-center gap-3 text-sm">
                      <Badge variant="outline" className="text-yellow-700">
                        {tx.cash_out_status}
                      </Badge>
                      <span>{formatCurrency(tx.cash_out_amount)}</span>
                      <span className="text-muted-foreground">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Method selection + form */}
      {!hasPending && methods.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Method list */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Cash Out Method</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {methods.map((method) => (
                  <button
                    key={method.cash_out_method_id}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      activeMethod?.cash_out_method_id === method.cash_out_method_id
                        ? "bg-green-50 dark:bg-green-950 border-l-2 border-green-600"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => selectMethod(method)}
                  >
                    <p className="font-medium">{method.cash_out_method_name}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{method.cash_out_method_category}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cash out form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                {activeMethod?.cash_out_method_name || "Cash Out"}
              </CardTitle>
              <CardDescription>
                Available balance: <span className="font-bold text-green-600">{formatCurrency(slotWallet)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label>Cash Out Amount ({activeMethod?.cash_out_method_currency || "PHP"})</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Enter amount"
                  value={cashOutAmount || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setCashOutAmount(val);
                    computeCharges(val);
                  }}
                />
                {activeMethod && (
                  <p className="text-xs text-muted-foreground">
                    Min: {formatCurrency(isInitial ? (activeMethod.initial_payout || 0) : (activeMethod.minimum_payout || 0))}
                    {activeMethod.cash_limit > 0 && <> · Max: {formatCurrency(activeMethod.cash_limit)}</>}
                  </p>
                )}
              </div>

              {/* Charge breakdown */}
              {cashOutAmount > 0 && (
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <button
                    className="flex items-center justify-between w-full text-sm font-medium"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                  >
                    <span>Charges & Total</span>
                    {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {showBreakdown && (
                    <div className="text-sm space-y-1 border-t pt-2 mt-2">
                      {fixCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Processing Fee</span>
                          <span>{formatCurrency(fixCharge)}</span>
                        </div>
                      )}
                      {taxCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Withholding Tax ({activeMethod?.cash_out_method_withholding_tax}%)</span>
                          <span>{formatCurrency(taxCharge)}</span>
                        </div>
                      )}
                      {serviceCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service Charge</span>
                          <span>{formatCurrency(serviceCharge)}</span>
                        </div>
                      )}
                      {gcCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GC Charge ({activeMethod?.gc_charge}%)</span>
                          <span>{formatCurrency(gcCharge)}</span>
                        </div>
                      )}
                      {(activeMethod?.product_charge || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Product Charge</span>
                          <span>{formatCurrency(activeMethod!.product_charge)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>Total Charges</span>
                    <span className="text-red-600">{formatCurrency(totalCharge)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>You will receive</span>
                    <span className={expectedReceivable < 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(expectedReceivable)}
                    </span>
                  </div>
                </div>
              )}

              {/* Account info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name / Account Name *</Label>
                  <Input value={primaryInfo} onChange={(e) => setPrimaryInfo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>
                    {activeMethod?.cash_out_method_category === "bank"
                      ? "Account Number *"
                      : activeMethod?.cash_out_method_category === "remittance"
                        ? "Address"
                        : "Account Number / Address *"}
                  </Label>
                  <div className="relative">
                    <Input value={secondaryInfo} onChange={(e) => setSecondaryInfo(e.target.value)} />
                    {activeMethod?.cash_out_method_category === "remittance" && addresses.length > 0 && (
                      <Button
                        variant="ghost" size="sm"
                        className="absolute right-1 top-1 h-7"
                        onClick={() => setShowAddresses(!showAddresses)}
                      >
                        <MapPin className="h-3 w-3 mr-1" /> Addresses
                      </Button>
                    )}
                  </div>
                  {/* Address dropdown */}
                  {showAddresses && addresses.length > 0 && (
                    <div className="border rounded max-h-40 overflow-y-auto divide-y">
                      {addresses.map((addr, i) => (
                        <button
                          key={addr.id || addr.address_id || i}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm transition-colors"
                          onClick={() => {
                            setSecondaryInfo(
                              [addr.additional_info, addr.barangay_city, addr.region_province]
                                .filter(Boolean).join(", ")
                            );
                            setShowAddresses(false);
                          }}
                        >
                          <span className="text-xs">
                            {[addr.additional_info, addr.barangay_city, addr.region_province].filter(Boolean).join(", ")}
                          </span>
                          {addr.is_default === 1 && <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number *</Label>
                  <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                </div>
                {activeMethod?.cash_out_method_category === "bank" && (
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select value={optionalInfo || "Savings"} onValueChange={setOptionalInfo}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Checking">Checking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={submitting || cashOutAmount <= 0}
                onClick={handleSubmit}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Submit Cash Out
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction history */}
      {allTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Charges</TableHead>
                    <TableHead>Receivable</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactions.slice(0, 20).map((tx) => (
                    <TableRow key={tx.cash_out_id}>
                      <TableCell className="font-medium">{formatCurrency(tx.cash_out_amount)}</TableCell>
                      <TableCell className="text-sm">{tx.cash_out_method_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          tx.cash_out_status === "approved" || tx.cash_out_status === "completed"
                            ? "default"
                            : tx.cash_out_status === "pending" || tx.cash_out_status === "processing"
                              ? "secondary"
                              : "destructive"
                        }>
                          {tx.cash_out_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.cash_out_method_fee || tx.cash_out_method_tax || tx.cash_out_method_service_charge
                          ? formatCurrency(
                              (tx.cash_out_method_fee || 0) +
                              (tx.cash_out_method_tax || 0) +
                              (tx.cash_out_method_service_charge || 0)
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.expected_receivable ? formatCurrency(tx.expected_receivable) : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TIN Dialog */}
      <Dialog open={tinDialogOpen} onOpenChange={setTinDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{tinMode === "add" ? "Add TIN" : "Edit TIN"}</DialogTitle>
            <DialogDescription>
              {tinMode === "add"
                ? "A TIN is required for this cash out. Please provide your TIN."
                : "Please update your TIN to continue."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>TIN Number</Label>
              <Input value={tinValue} onChange={(e) => setTinValue(e.target.value)} placeholder="Enter your TIN" />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" value={tinPassword} onChange={(e) => setTinPassword(e.target.value)} placeholder="Enter your password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTinDialogOpen(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" disabled={tinSubmitting || !tinValue.trim()} onClick={submitTin}>
              {tinSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {tinMode === "add" ? "Add TIN" : "Update TIN"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
