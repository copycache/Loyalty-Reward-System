"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function MemberInvestmentPage() {
  const { token } = useAuthStore();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [packages, setPackages] = useState<any[]>([]);
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [amount, setAmount] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchInvestments = async (pg: number) => {
    try {
      const res = await apiPost("/api/investment/get_investment_list", { page: pg }, token);
      if (res?.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        setInvestments(list);
        setTotalPages(res.data.last_page || res.last_page || 1);
      }
    } catch {}
    setLoading(false);
  };

  const fetchPackages = async () => {
    try {
      const res = await apiPost("/api/investment/get_package_list", {}, token);
      if (Array.isArray(res)) setPackages(res);
      else if (res?.data) setPackages(res.data);
    } catch {}
    try {
      const res = await apiPost("/api/investment/get_minimum_amount", {}, token);
      if (res?.minimum_amount || res?.amount) setMinimumAmount(res.minimum_amount || res.amount);
      else if (res?.data?.minimum_amount) setMinimumAmount(res.data.minimum_amount);
    } catch {}
  };

  useEffect(() => {
    if (!token) return;
    fetchInvestments(page);
  }, [token, page]);

  const handlePreview = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!selectedPackage) {
      toast.error("Please select an investment package.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost("/api/investment/preview", {
        amount,
        package_id: selectedPackage,
      }, token);
      if (res) {
        setPreviewData(res.data || res);
        setShowPreview(true);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load preview.");
    }
    setSubmitting(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await apiPost("/api/investment/submit", {
        amount,
        package_id: selectedPackage,
      }, token);
      if (res.status === "success" || res.status_code === 200) {
        toast.success(res.status_message || "Investment submitted successfully!");
        setShowAddDialog(false);
        setShowPreview(false);
        setAmount("");
        setSelectedPackage("");
        setPreviewData(null);
        setPage(1);
        fetchInvestments(1);
      } else {
        toast.error(res.status_message || "Failed to submit investment.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Investment submission failed.");
    }
    setSubmitting(false);
  };

  const formatCurrency = (val: any) => {
    const num = parseFloat(val) || 0;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  };

  const totalPrincipal = investments.reduce((sum, inv) => sum + (parseFloat(inv.principal_amount || inv.amount) || 0), 0);
  const totalInterest = investments.reduce((sum, inv) => sum + (parseFloat(inv.interest_amount || inv.interest) || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Investment</h1>
        <Button onClick={() => { setShowAddDialog(true); fetchPackages(); }} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-1" /> Add Investment
        </Button>
      </div>

      {investments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No investments yet</p>
            <p className="text-sm">Start your investment journey today!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Interest (%)</TableHead>
                    <TableHead>Investment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remaining Days</TableHead>
                    <TableHead className="text-right">Principal Amount</TableHead>
                    <TableHead className="text-right">Interest Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((inv, i) => (
                    <TableRow key={inv.id || i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{inv.interest_rate || inv.interest_percent || 0}%</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : inv.date || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={inv.status === "active" || inv.status === "completed" ? "default" : "secondary"}>
                          {inv.status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>{inv.remaining_days ?? inv.remaining ?? "-"}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(inv.principal_amount || inv.amount)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{formatCurrency(inv.interest_amount || inv.interest)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <tfoot>
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={5} className="text-right">Total</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalPrincipal)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(totalInterest)}</TableCell>
                  </TableRow>
                </tfoot>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) { setShowPreview(false); setPreviewData(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Investment</DialogTitle>
            <DialogDescription>Choose a package and enter the amount</DialogDescription>
          </DialogHeader>
          {!showPreview ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder={`Minimum: ${formatCurrency(minimumAmount)}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={minimumAmount}
                />
                {minimumAmount > 0 && (
                  <p className="text-xs text-muted-foreground">Minimum: {formatCurrency(minimumAmount)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Investment Package</Label>
                <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
                  {packages.length > 0 ? packages.map((pkg: any) => (
                    <div key={pkg.id || pkg.package_id} className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value={String(pkg.id || pkg.package_id)} id={`pkg-${pkg.id || pkg.package_id}`} />
                      <Label htmlFor={`pkg-${pkg.id || pkg.package_id}`} className="flex-1 cursor-pointer">
                        <span className="font-medium">{pkg.name || pkg.package_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({pkg.interest_rate || pkg.interest}%)</span>
                      </Label>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No packages available.</p>
                  )}
                </RadioGroup>
              </div>
              <Button className="w-full" onClick={handlePreview} disabled={submitting || !amount || !selectedPackage}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Preview
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {previewData && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(Array.isArray(previewData) ? previewData : previewData.breakdown || []).map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{item.period || item.month || `Month ${i + 1}`}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">{formatCurrency(item.amount || item.interest)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowPreview(false)}>
                  Back
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Investment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
