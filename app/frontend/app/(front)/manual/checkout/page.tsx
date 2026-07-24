"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { ImagePlus, X } from "lucide-react";

interface OrderDetails {
  order_id: number;
  grand_total: number;
}

export default function ManualCheckoutPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(() => {
    const oid = searchParams.get("order_id");
    const gt = searchParams.get("grand_total");
    if (oid && gt) {
      return { order_id: Number(oid), grand_total: Number(gt) };
    }
    return null;
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [datetime, setDatetime] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [senderName, setSenderName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload your proof of payment.");
      return;
    }
    if (!referenceNumber) {
      toast.error("Please enter the reference number.");
      return;
    }
    if (!senderName) {
      toast.error("Please enter the sender name.");
      return;
    }
    if (!amount) {
      toast.error("Please enter the amount.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("proof_of_payment", file);
      formData.append("order_id", String(orderDetails?.order_id || ""));
      formData.append("datetime", datetime);
      formData.append("reference_number", referenceNumber);
      formData.append("sender_name", senderName);
      formData.append("contact_no", contactNo);
      formData.append("amount", amount);

      const res = await fetch("/api/manual_checkout_submit", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Submission failed");

      toast.success("Payment proof submitted successfully!");
      handleRemoveFile();
      setDatetime("");
      setReferenceNumber("");
      setSenderName("");
      setContactNo("");
      setAmount("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white">
      <section className="py-16">
        <div className="container mx-auto px-4" style={{ marginTop: "80px" }}>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Reference & Total */}
              {orderDetails && (
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <p className="text-sm text-muted-foreground">
                    Transaction Reference Number for this transaction is
                    <br />
                    <span className="text-lg font-bold text-primary">
                      ORDER-{orderDetails.order_id}
                    </span>
                    <br />
                    <span className="text-2xl font-bold">
                      &#8369;{orderDetails.grand_total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                    <br />
                    E-Mail for this link has been sent to your e-mail address.
                    <br />
                    You can click below to upload your proof of payment.
                  </p>
                </div>
              )}

              {/* Proof of Payment Form */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <h6 className="font-semibold">Proof of Payment (Image)</h6>
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileRef.current?.click()}
                    >
                      {preview ? (
                        <div className="relative inline-block">
                          <img
                            src={preview}
                            alt="Preview"
                            className="max-h-48 rounded-lg object-contain mx-auto"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ImagePlus className="h-10 w-10" />
                          <span className="font-medium">TAP TO SELECT AN IMAGE</span>
                        </div>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="datetime">Date and Time</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={datetime}
                      onChange={(e) => setDatetime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refno">Reference Number</Label>
                    <Input
                      id="refno"
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender">Sender Name</Label>
                    <Input
                      id="sender"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Sender Contact No.</Label>
                    <Input
                      id="contact"
                      type="tel"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </form>
              </div>

              {/* Account List */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="font-bold text-sm mb-3">ACCOUNT LIST</div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">
                      For bank deposit use the information below.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Account Name:{" "}
                      <span className="font-semibold text-foreground">SUCCESS COMMUNITY</span>
                      <br />
                      BDO Account Number:{" "}
                      <span className="font-semibold text-foreground">1234-5678-90</span>
                      <br />
                      BPI Savings Bank:{" "}
                      <span className="font-semibold text-foreground">1234-5678-90</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Step by Step Instructions */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="font-bold text-lg mb-4">STEP BY STEP INSTRUCTION</div>

                <div className="space-y-6">
                  <div>
                    <div className="font-semibold mb-2">STEP 1: PAYMENT</div>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Go to the nearest/bank or remittance center that is listed on the left corner (account list).</li>
                      <li>Deposit or remit on the given details in the left corner (account list)</li>
                      <li>Make sure that a proof of payment is provided once you deposit or remit.</li>
                    </ol>
                  </div>

                  <div>
                    <div className="font-semibold mb-2">STEP 2: CONFIRMATION</div>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Visit this URL, which you can easily reach using your e-mail address.</li>
                      <li>On this page, you can upload a copy of your proof of payment. You can upload a scanned copy or a copy captured by your camera.</li>
                      <li>We will send a confirmation email to you once processed. If you do not receive one within 48 hours, you may call or contact us directly using this e-mail address.</li>
                    </ol>
                  </div>

                  <div>
                    <div className="font-semibold mb-2">GENERAL RULES</div>
                    <p className="text-sm text-muted-foreground space-y-3">
                      Pay the exact amount indicated above. Excess portion of your payment is forfeited. Payment less than the amount due will not be processed.
                      <br /><br />
                      If you are paying multiple ORDERS Reference Numbers, pay separately for each reference number. Do not lump them into a single transaction.
                      <br /><br />
                      If you made a short payment by mistake, do not try to correct it by making another bills payment with the same reference number.
                      <br /><br />
                      Contact us immediately if you made a mistake in your payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
