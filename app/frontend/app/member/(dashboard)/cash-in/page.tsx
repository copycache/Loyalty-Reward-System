"use client";

import { useEffect, useState, useCallback } from "react";
import { apiPost, apiUpload } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2, Upload, ChevronLeft, ChevronRight, AlertCircle, FileText, CheckCircle2,
  CreditCard, ImageIcon, DollarSign, Trash2, Eye,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function MemberCashInPage() {
  const { token, currentSlot } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [methodTable, setMethodTable] = useState<any[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [dataFocus, setDataFocus] = useState<any>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState<number | null>(null);

  // Form
  const [cashInAmount, setCashInAmount] = useState<number>(0);
  const [totalDue, setTotalDue] = useState(0);
  const [totalCharge, setTotalCharge] = useState(0);
  const [expectedReceivable, setExpectedReceivable] = useState(0);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [attachmentLink, setAttachmentLink] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // History
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const computeTotalDue = useCallback((fix = 0, percent = 0, service = 0) => {
    const due = cashInAmount - fix - service - ((percent / 100) * cashInAmount);
    setTotalDue(due < 0 ? 0 : due);
    setTotalCharge(due !== cashInAmount ? due - cashInAmount : 0);
    setExpectedReceivable(cashInAmount);
  }, [cashInAmount]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    const loadAll = async () => {
      try {
        const [pendingRes, methodRes, historyRes] = await Promise.all([
          apiPost<any>("/api/cashin/get_transactions", {
            cash_in_status: "pending",
            slot_id: currentSlot?.slot_id,
            user: "member",
          }, token),
          apiPost<any>("/api/cashin/get_method_list", {}, token),
          apiPost<any>("/api/cashin/get_transactions", {
            cash_in_status: "all",
            slot_id: currentSlot?.slot_id,
            user: "member",
          }, token),
        ]);

        const pending = Array.isArray(pendingRes?.data)
          ? pendingRes.data
          : Array.isArray(pendingRes)
            ? pendingRes
            : [];
        setPendingTransactions(pending);

        const methods = Array.isArray(methodRes?.data)
          ? methodRes.data
          : Array.isArray(methodRes)
            ? methodRes
            : [];
        setMethodTable(methods);

        const allTxns = Array.isArray(historyRes?.data?.data)
          ? historyRes.data.data
          : Array.isArray(historyRes?.data)
            ? historyRes.data
            : Array.isArray(historyRes)
              ? historyRes
              : [];
        setHistory(allTxns);
        setHistoryTotalPages(historyRes?.data?.last_page || 1);
        setHistoryLoading(false);

        // Auto-select last method or first
        const lastTxn = Array.isArray(historyRes?.data) && historyRes.data.length > 0
          ? historyRes.data[historyRes.data.length - 1]
          : Array.isArray(historyRes?.data?.data) && historyRes.data.data.length > 0
            ? historyRes.data.data[historyRes.data.data.length - 1]
            : null;

        if (lastTxn?.cash_in_method_currency === "LW") {
          chooseMethod(lastTxn.cash_in_method_id, lastTxn.cash_in_method_category);
        } else if (methods.length > 0) {
          chooseMethod(methods[0].cash_in_method_id, methods[0].cash_in_method_category);
        }
      } catch {
        setHistoryLoading(false);
      }
      setLoading(false);
    };

    loadAll();
  }, [token, currentSlot]);

  const chooseMethod = (id: number, cat: string) => {
    setActiveMethod(id);
    setCashInAmount(0);
    setUploaded(false);
    setAttachmentLink(null);
    setUploadedFileName(null);
    const found = methodTable.find((m: any) => m.cash_in_method_id === id);
    setDataFocus(found);
    setCategory(cat);
    if (found) {
      computeTotalDue(
        found.cash_in_method_charge_fixed || 0,
        found.cash_in_method_charge_percentage || 0,
        found.cash_in_method_service_charge || 0
      );
    }
  };

  const uploadFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("upload", file);
    formData.append("folder", "cash_in_proof");
    try {
      const res = await apiUpload<any>("/api/upload", formData, token);
      setUploadedFileName(file.name);
      setAttachmentLink(typeof res === "string" ? res : res?.url || res?.path || "");
      setUploaded(true);
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
  };

  const removeAttachment = () => {
    setAttachmentLink(null);
    setUploaded(false);
    setUploadedFileName(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) uploadFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!uploaded) {
      toast.error("Please upload payment proof to proceed.");
      return;
    }
    if (!cashInAmount || cashInAmount < (dataFocus?.cash_in_method_minimum_amount || 0)) {
      toast.error("Cash In amount is invalid.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiPost<any>("/api/cashin/record_cash_in", {
        slot_id: currentSlot?.slot_id,
        cash_in_wallet: dataFocus?.cash_in_method_currency || "PHP",
        cash_in_amount: cashInAmount,
        total_due: totalDue,
        cash_in_proof: attachmentLink,
        cash_in_method_id: dataFocus?.cash_in_method_id,
        cash_in_method_currency: dataFocus?.cash_in_method_currency,
        expected_receivable: expectedReceivable,
      }, token);
      if (res?.status === "success") {
        toast.success("Cash In request successfully submitted!");
        setCashInAmount(0);
        removeAttachment();
        window.location.reload();
      } else {
        toast.error(res?.status_message || "Failed to submit cash-in.");
      }
    } catch {
      toast.error("Cash-in failed.");
    }
    setSubmitting(false);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[169px] bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-[900px] bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Top-up / Cash In</h1>
      </div>

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && !loading && (
        <div className="space-y-4">
          {pendingTransactions.map((item: any, idx: number) => (
            <Card key={idx} className="border-l-4 border-l-yellow-400">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    variant={
                      item.cash_in_status === "approved"
                        ? "default"
                        : item.cash_in_status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                    className="uppercase"
                  >
                    {item.cash_in_status} TOP-UP
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Payment Method</div>
                      <div className="font-medium">{item.cash_in_method_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Payment Proof</div>
                      <a
                        href={item.cash_in_proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> Click to View
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Receiving Wallet</div>
                      <div className="font-medium">Top-up Wallet</div>
                    </div>
                  </div>
                </div>

                {item.cash_in_receivable && (
                  <div className="text-right mb-2">
                    <div className="text-sm text-muted-foreground">Total Amount Paid</div>
                    <div className="text-xl font-bold">
                      PHP {Number(item.cash_in_receivable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {item.cash_in_charge && (
                  <div className="border-t pt-3">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setShowBreakdown(!showBreakdown)}
                    >
                      <span className="text-sm font-medium">Total Deductions</span>
                      <span className="text-sm text-red-600">
                        PHP {Math.abs(Number(item.cash_in_charge)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {showBreakdown && (
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground pl-2">
                        {item.cash_in_method_charge_fixed && (
                          <div className="flex justify-between">
                            <span>Method Charge (Fixed)</span>
                            <span>PHP {Number(item.cash_in_method_charge_fixed).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {item.cash_in_method_charge_percentage && (
                          <div className="flex justify-between">
                            <span>Method Charge ({Number(item.cash_in_method_charge_percentage).toFixed(2)}%)</span>
                            <span>
                              PHP {((Number(item.cash_in_method_charge_percentage) / 100) * Number(item.cash_in_receivable)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {item.cash_in_method_service_charge && (
                          <div className="flex justify-between">
                            <span>Service Charge</span>
                            <span>PHP {Number(item.cash_in_method_service_charge).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {item.cash_in_payable && (
                  <div className={`border-t pt-3 ${!item.cash_in_charge ? "mt-2" : ""}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">You will Receive</span>
                      <span className="text-lg font-bold text-green-600">
                        PHP {Number(item.cash_in_payable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main form (no pending) */}
      {!loading && pendingTransactions.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Method Cards */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {methodTable.map((method: any) => (
                <div
                  key={method.cash_in_method_id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    activeMethod === method.cash_in_method_id
                      ? "border-green-500 bg-green-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    chooseMethod(method.cash_in_method_id, method.cash_in_method_category)
                  }
                >
                  <div className="flex items-center gap-3">
                    {method.cash_in_method_thumbnail && (
                      <img
                        src={method.cash_in_method_thumbnail}
                        alt=""
                        className="w-10 h-10 object-contain"
                      />
                    )}
                    <div className="font-medium text-sm">
                      {method.cash_in_method_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Guidelines */}
            {dataFocus && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase">TOP-UP GUIDELINES</CardTitle>
                </CardHeader>
                <CardContent>
                  {category === "bank" || category === "e-wallet" ? (
                    <div className="space-y-4">
                      <p className="text-sm">
                        1. Complete payment at any{" "}
                        <span className="font-semibold">{dataFocus.cash_in_method_name}</span> branch to the
                        following account:
                      </p>
                      <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                        {dataFocus.primary_info && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Account Name:</span>
                            <span className="font-medium">{dataFocus.primary_info}</span>
                          </div>
                        )}
                        {dataFocus.secondary_info && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Account Number:</span>
                            <span className="font-medium font-mono">{dataFocus.secondary_info}</span>
                          </div>
                        )}
                        {dataFocus.optional_info && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Account Type:</span>
                            <span className="font-medium">{dataFocus.optional_info}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm">2. Upload your proof of payment.</p>
                    </div>
                  ) : category === "remittance" ? (
                    <div className="space-y-4">
                      <p className="text-sm">
                        1. Complete payment at any{" "}
                        <span className="font-semibold">{dataFocus.cash_in_method_name}</span> branch to the
                        following details:
                      </p>
                      <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                        {dataFocus.primary_info && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Receiver Name:</span>
                            <span className="font-medium">{dataFocus.primary_info}</span>
                          </div>
                        )}
                        {dataFocus.secondary_info && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Receiver Address:</span>
                            <span className="font-medium">{dataFocus.secondary_info}</span>
                          </div>
                        )}
                        {dataFocus.optional_info && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Other Information:</span>
                            <span className="font-medium">{dataFocus.optional_info}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm">2. Upload your proof of payment.</p>
                    </div>
                  ) : category === "crypto" ? (
                    <div className="space-y-4">
                      <p className="text-sm">1. Send payment using the following details:</p>
                      <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                        {dataFocus.primary_info && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bitcoin Deposit Address:</span>
                            <span className="font-medium font-mono text-xs break-all">{dataFocus.primary_info}</span>
                          </div>
                        )}
                        {dataFocus.secondary_info && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Receiver Address:</span>
                            <span className="font-medium">{dataFocus.secondary_info}</span>
                          </div>
                        )}
                        {dataFocus.optional_info && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Other Information:</span>
                            <span className="font-medium">{dataFocus.optional_info}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm">2. Upload your proof of payment.</p>
                    </div>
                  ) : category === "crypto2" ? (
                    <div className="text-center space-y-3">
                      {dataFocus.crypto_thumbnail && (
                        <img
                          src={dataFocus.crypto_thumbnail}
                          alt="Crypto QR"
                          className="mx-auto max-w-[200px]"
                        />
                      )}
                      <p className="font-semibold">Scan to Top-up</p>
                    </div>
                  ) : null}

                  {/* File Upload */}
                  {category !== "crypto2" && (
                    <div className="mt-4">
                      {!uploaded && !uploading && (
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                            isDragging
                              ? "border-primary bg-primary/10"
                              : "border-muted-foreground/25 hover:border-primary/50"
                          }`}
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onDrop={onDrop}
                          onClick={() => document.getElementById("cashin-file-upload")?.click()}
                        >
                          <input
                            id="cashin-file-upload"
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={onFileChange}
                          />
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">
                            Drag & Drop files here or <span className="text-blue-600">Browse</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Accepted formats: JPG, PNG, PDF
                          </p>
                        </div>
                      )}

                      {uploading && (
                        <div className="flex items-center justify-center gap-2 p-4 text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      )}

                      {uploaded && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium truncate max-w-[250px]">
                              {uploadedFileName}
                            </span>
                          </div>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={removeAttachment}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        3. Please allow <span className="font-semibold">24 hours</span> for verification.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Input + Summary */}
          {dataFocus && (
            <div className="space-y-4">
              {/* Amount Input */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase">
                    How much would you like to <span className="text-green-600">TOP-UP?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                      PHP
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={cashInAmount || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCashInAmount(val);
                        if (dataFocus) {
                          computeTotalDue(
                            dataFocus.cash_in_method_charge_fixed || 0,
                            dataFocus.cash_in_method_charge_percentage || 0,
                            dataFocus.cash_in_method_service_charge || 0
                          );
                        }
                      }}
                      className="pl-14 text-2xl font-bold h-14"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase">TOP-UP SUMMARY</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum Amount</span>
                    <span className="font-medium">
                      PHP {Number(dataFocus.cash_in_method_minimum_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-semibold">{dataFocus.cash_in_method_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span>
                      {uploading ? (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                        </span>
                      ) : uploaded ? (
                        <span className="text-green-600 font-medium">Payment proof uploaded</span>
                      ) : (
                        <span className="text-red-500 font-medium">Pending proof of payment</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receiving Wallet</span>
                    <span className="font-medium">Top-up Wallet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Top-up Amount</span>
                    <span className="font-medium">
                      PHP {cashInAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {dataFocus.cash_in_method_charge_fixed ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method Charge (Fixed)</span>
                      <span className="font-medium">
                        PHP {Number(dataFocus.cash_in_method_charge_fixed).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ) : null}
                  {dataFocus.cash_in_method_charge_percentage ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Method Charge ({Number(dataFocus.cash_in_method_charge_percentage).toFixed(2)}%)
                      </span>
                      <span className="font-medium">
                        PHP{" "}
                        {(
                          (Number(dataFocus.cash_in_method_charge_percentage) / 100) *
                          (cashInAmount || 0)
                        ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ) : null}
                  {dataFocus.cash_in_method_service_charge ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Charge</span>
                      <span className="font-medium">
                        PHP {Number(dataFocus.cash_in_method_service_charge).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ) : null}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-medium">You will Receive</span>
                    <span className="font-bold text-green-600 text-lg">
                      PHP{" "}
                      {totalDue > 0
                        ? totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })
                        : (0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Proceed Button */}
              <Button
                className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg"
                disabled={submitting || !uploaded || !cashInAmount || cashInAmount === 0}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <img
                      src="/icons/proceed-icon.png"
                      alt=""
                      className="h-6 w-6 mr-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    PROCEED ON TOP-UP
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Cash In History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No cash-in history.
            </div>
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
                      <TableCell className="text-sm">
                        {h.created_at
                          ? new Date(h.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₱
                        {(
                          parseFloat(h.amount || h.cash_in_amount) || 0
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {h.payment_method || h.cash_in_method_name || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {h.reference_no || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            h.status === "approved" ||
                            h.cash_in_status === "approved"
                              ? "default"
                              : h.status === "pending" ||
                                  h.cash_in_status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
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
        {historyTotalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={historyPage <= 1}
              onClick={() => setHistoryPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {historyPage} of {historyTotalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={historyPage >= historyTotalPages}
              onClick={() => setHistoryPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
