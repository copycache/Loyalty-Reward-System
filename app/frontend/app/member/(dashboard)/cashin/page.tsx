"use client";

import { useEffect, useState, useCallback } from "react";
import { apiPost, apiUpload } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Upload, ChevronLeft, ChevronRight, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PaymentDetails } from "@/components/member/cashin/PaymentDetails";

export default function MemberCashInPage() {
  const { token, currentSlot } = useAuthStore();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  
  // Fees & Calculations
  const [serviceCharge, setServiceCharge] = useState(0); 
  const [totalDue, setTotalDue] = useState(0);
  const [expectedReceivable, setExpectedReceivable] = useState(0);

  // Drag & Drop
  const [isDragging, setIsDragging] = useState(false);

  const fetchHistory = async (pg: number) => {
    try {
      const res = await apiPost("/api/cashin/get_transactions", { cash_in_status: "all", page: pg }, token);
      if (res?.data) {
        setHistory(res.data.data || res.data);
        setTotalPages(res.data.last_page || 1);
      }
    } catch {}
    setLoading(false);
  };

  const fetchPending = async () => {
      try {
          const res = await apiPost("/api/cashin/get_transactions", { cash_in_status: "pending", user: 'member' }, token);
           if (res?.data) {
                // Ensure array
                const pending = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setPendingTransactions(pending);
           }
      } catch {}
  };

  useEffect(() => {
    if (!token) return;
    fetchHistory(page);
    fetchPending();
    apiPost("/api/cashin/get_method_list", {}, token).then((res) => {
      if (res?.data) setPaymentChannels(res.data);
    });
    // Fetch service charges if API available
    // apiPost("/api/settings/get_service_charge", { type: 'cash_in' }, token).then(...)
  }, [token, page]);

  // Update calculations
  useEffect(() => {
      const amt = parseFloat(amount) || 0;
      // Legacy logic: total_due = amount - fees? 
      // Wait, usually Cash In: You pay X, you get X minus fees? Or you pay X + fees to get X?
      // Legacy: total_due = cash_in_amount - fix - service - percent... 
      // This implies deduction from amount.
      // Let's assume 0 fees for now unless specific method logic exists.
      
      const charge = 0; // implementation dependent
      setServiceCharge(charge);
      setTotalDue(amt); 
      setExpectedReceivable(amt - charge);

  }, [amount, paymentMethod]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setReceipt(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }
    if (!receipt) {
        toast.error("Proof of payment is required.");
        return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("cash_in_amount", amount);
      formData.append("cash_in_method_id", paymentMethod);
      if (currentSlot?.slot_id) formData.append("slot_id", String(currentSlot.slot_id));
      formData.append("total_due", totalDue.toString());
      formData.append("cash_in_wallet", "LW"); // Default per legacy
      formData.append("expected_receivable", expectedReceivable.toString());
      if (referenceNo) formData.append("reference_no", referenceNo); // If API supports it
      if (receipt) formData.append("cash_in_proof", receipt);

      const res = await apiUpload("/api/cashin/record_cash_in", formData, token);
      if (res.status === "success" || res.status_code === 200) {
        toast.success(res.status_message || "Cash-in request submitted!");
        setAmount("");
        setReferenceNo("");
        setReceipt(null);
        setPaymentMethod("");
        setPage(1);
        fetchHistory(1);
        fetchPending();
      } else {
          toast.error(res.status_message || "Failed to submit cash-in.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Cash-in failed.");
    }
    setSubmitting(false);
  };

  const selectedMethodObj = paymentChannels.find(p => String(p.id || p.cash_in_method_id) === String(paymentMethod));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Top-up / Cash In</h1>
      </div>

      {pendingTransactions.length > 0 && (
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pending Transactions</AlertTitle>
              <AlertDescription>
                  You have {pendingTransactions.length} pending cash-in request(s). Please wait for approval before submitting another one.
              </AlertDescription>
          </Alert>
      )}

      <Tabs defaultValue="request">
        <TabsList>
          <TabsTrigger value="request">New Request</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="request">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Form Section */}
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Cash In Details</CardTitle>
                    <CardDescription>Select a method and enter amount</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentChannels.length > 0 ? (
                            paymentChannels.map((ch: any) => (
                                <SelectItem key={ch.id || ch.cash_in_method_id} value={String(ch.id || ch.cash_in_method_id)}>
                                {ch.name || ch.cash_in_method_name}
                                </SelectItem>
                            ))
                            ) : (
                                <div className="p-2 text-sm text-muted-foreground">Loading methods...</div>
                            )}
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Amount (₱)</Label>
                        <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        />
                         {selectedMethodObj && selectedMethodObj.min_amount && (
                             <p className="text-xs text-muted-foreground">Min: {selectedMethodObj.min_amount}</p>
                         )}
                    </div>
                    
                    <div className="p-4 bg-muted rounded-md space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Amount</span>
                            <span>₱{(parseFloat(amount) || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Service Charge</span>
                            <span>₱{serviceCharge.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total Due</span>
                            <span>₱{totalDue.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Reference Number</Label>
                        <Input
                        placeholder="Enter reference no."
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Proof of Payment</Label>
                        <div 
                            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"
                            }`}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <Input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                            />
                            {receipt ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="h-6 w-6" />
                                    <span className="font-medium truncate max-w-[200px]">{receipt.name}</span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF</p>
                                </>
                            )}
                        </div>
                    </div>

                    <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleSubmit}
                        disabled={submitting || !amount || !paymentMethod || !receipt}
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                        Submit Request
                    </Button>
                    </CardContent>
                </Card>
             </div>

             {/* Instructions Section */}
             <div className="space-y-6">
                 {selectedMethodObj ? (
                     <PaymentDetails method={selectedMethodObj} />
                 ) : (
                     <Card className="bg-muted/50 border-dashed flex items-center justify-center p-12">
                         <div className="text-center text-muted-foreground">
                             <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                             <p>Select a payment method to view instructions</p>
                         </div>
                     </Card>
                 )}
             </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No cash-in history.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((h: any) => (
                        <TableRow key={h.id}>
                          <TableCell className="text-sm">{h.created_at ? new Date(h.created_at).toLocaleDateString() : "-"}</TableCell>
                          <TableCell className="font-semibold">₱{(parseFloat(h.amount || h.cash_in_amount) || 0).toLocaleString()}</TableCell>
                          <TableCell>{h.payment_method || h.cash_in_method_name || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{h.reference_no || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={h.status === "approved" || h.cash_in_status === "approved" ? "default" : (h.status === "pending" || h.cash_in_status === "pending") ? "secondary" : "destructive"}>
                              {h.status || h.cash_in_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
