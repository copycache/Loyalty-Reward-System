"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  MapPin, Plus, Settings, Columns3, Info, ChevronLeft, ChevronRight,
  RefreshCw, Save, Loader2, CheckCircle, Trash2, Undo, Eye, FileSpreadsheet,
  FileText, Search, Building2, Users, Package, CreditCard, Layers,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminCashierPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchData, setBranchData] = useState(0);
  const [locationList, setLocationList] = useState<any[]>([]);
  const [stockistList, setStockistList] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<any[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [totalSales, setTotalSales] = useState(0);
  const [filter, setFilter] = useState({ branch_type: "all", branch_location: "all", search_key: "" });
  const [branch, setBranch] = useState<any>({});
  const [data, setData] = useState<any>(null);
  const [cashierList, setCashierList] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);
  const [codeList, setCodeList] = useState<any[]>([]);
  const [codeSelect, setCodeSelect] = useState<any>({});
  const [codeFilter, setCodeFilter] = useState({ status: "all", search: "" });
  const [cashierFilter, setCashierFilter] = useState({ status: "all", position: "all" });
  const [cashier, setCashier] = useState<any>({});
  const [cashierInfo, setCashierInfo] = useState<any>({});
  const [cashierAccessList, setCashierAccessList] = useState<any>(null);
  const [addMethod, setAddMethod] = useState("");
  const [rowClicked, setRowClicked] = useState<number | null>(null);
  const [p, setP] = useState(1);

  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [editBranchOpen, setEditBranchOpen] = useState(false);
  const [manageLocationOpen, setManageLocationOpen] = useState(false);
  const [manageStockistOpen, setManageStockistOpen] = useState(false);
  const [managePaymentOpen, setManagePaymentOpen] = useState(false);
  const [addCashierOpen, setAddCashierOpen] = useState(false);
  const [editCashierOpen, setEditCashierOpen] = useState(false);
  const [cashierAccessOpen, setCashierAccessOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [editTab, setEditTab] = useState("information");

  const loadBranchList = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiPost<any>("/api/admin/cashier/branches", filter, token);
      setBranchList(res?.data || []);
      setBranchData(res?.data?.length > 0 ? 1 : 0);
      setTotalSales(res?.data?.reduce((s: number, b: any) => s + (Number(b.total_sales) || 0), 0) || 0);
    } catch { toast.error("Failed to load branches"); }
    setLoading(false);
  }, [token, filter]);

  const loadLocations = useCallback(async () => {
    if (!token) return;
    try { setLocationList(await apiPost<any[]>("/api/admin/cashier/locations", {}, token) || []); }
    catch { /* ignore */ }
  }, [token]);

  const loadStockistLevels = useCallback(async () => {
    if (!token) return;
    try { setStockistList(await apiPost<any[]>("/api/admin/cashier/stockist-levels", {}, token) || []); }
    catch { /* ignore */ }
  }, [token]);

  const loadPaymentMethods = useCallback(async () => {
    if (!token) return;
    try { setPaymentMethod(await apiPost<any[]>("/api/admin/cashier/payment-methods", {}, token) || []); }
    catch { /* ignore */ }
  }, [token]);

  const loadCompanyInfo = useCallback(async () => {
    if (!token) return;
    try { setCompanyInfo(await apiPost<any>("/api/branch/cashier/load_company_info", {}, token)); }
    catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    loadBranchList();
    loadLocations();
    loadStockistLevels();
    loadPaymentMethods();
    loadCompanyInfo();
  }, []);

  const branchSubmit = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/admin/cashier/branch-create", branch, token);
      toast.success("Branch saved");
      setAddBranchOpen(false);
      loadBranchList();
    } catch { toast.error("Failed"); }
    setSubmitted(false);
  };

  const editBranch = async (branchId: number) => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/admin/cashier/branch-detail", { branch_id: branchId }, token);
      setData(res);
      setEditTab("information");

      const cashiers = await apiPost<any[]>("/api/admin/cashier/branch-cashiers", { branch_id: branchId, ...cashierFilter }, token);
      setCashierList(cashiers || []);

      const products = await apiPost<any[]>("/api/admin/cashier/branch-products", { branch_id: branchId }, token);
      setProductList(products || []);

      setEditBranchOpen(true);
    } catch { toast.error("Failed"); }
  };

  const updateBranch = async () => {
    if (!token || !data) return;
    setSubmitted(true);
    try {
      await apiPost("/api/admin/cashier/branch-update", data, token);
      toast.success("Branch updated");
      loadBranchList();
    } catch { toast.error("Failed"); }
    setSubmitted(false);
  };

  const archiveBranch = async (id: number) => {
    if (!token) return;
    try {
      await apiPost("/api/admin/cashier/branch-archive", { branch_id: id }, token);
      toast.success("Archived");
      setEditBranchOpen(false);
      loadBranchList();
    } catch { toast.error("Failed"); }
  };

  const restoreBranch = async (id: number) => {
    if (!token) return;
    try {
      await apiPost("/api/admin/cashier/branch-restore", { branch_id: id }, token);
      toast.success("Restored");
      setEditBranchOpen(false);
      loadBranchList();
    } catch { toast.error("Failed"); }
  };

  const selectItem = async (itemId: number, itemSku: string, index: number) => {
    if (!token) return;
    setRowClicked(index);
    setCodeSelect({ item_id: itemId, item_sku: itemSku });
    try {
      const codes = await apiPost<any[]>("/api/admin/cashier/item-codes", { item_id: itemId, ...codeFilter }, token);
      setCodeList(codes || []);
    } catch { /* ignore */ }
  };

  const loadCashiers = async () => {
    if (!token || !data) return;
    try {
      const cashiers = await apiPost<any[]>("/api/admin/cashier/branch-cashiers", { branch_id: data.branch_id, ...cashierFilter }, token);
      setCashierList(cashiers || []);
    } catch { /* ignore */ }
  };

  const cashierAdd = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/admin/cashier/cashier-create", { ...cashier, branch_id: data?.branch_id }, token);
      toast.success("Cashier added");
      setAddCashierOpen(false);
      setCashier({});
      loadCashiers();
    } catch { toast.error("Failed"); }
    setSubmitted(false);
  };

  const editCashierSubmit = async (cashierId: number) => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/admin/cashier/cashier-update", { cashier_id: cashierId, ...cashierInfo }, token);
      toast.success("Cashier updated");
      setEditCashierOpen(false);
      loadCashiers();
    } catch { toast.error("Failed"); }
    setSubmitted(false);
  };

  const accessListSubmit = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/admin/cashier/access-update", cashierAccessList, token);
      toast.success("Access updated");
      setCashierAccessOpen(false);
    } catch { toast.error("Failed"); }
    setSubmitted(false);
  };

  const addLocationSubmit = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/admin/cashier/locations-save", locationList, token);
      toast.success("Locations saved");
      loadLocations();
    } catch { toast.error("Failed"); }
    setSubmitted(false);
  };

  const addStockistLevel = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/admin/cashier/stockist-levels-save", stockistList, token);
      toast.success("Levels saved");
      loadStockistLevels();
    } catch { toast.error("Failed"); }
    setSubmitted(false);
  };

  const selectedPayment = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/admin/cashier/payment-methods-save", paymentMethod, token);
      toast.success("Payment methods saved");
      loadPaymentMethods();
    } catch { toast.error("Failed"); }
    setSubmitted(false);
  };

  const addPaymentMethod = async () => {
    if (!token || !addMethod) return;
    try {
      await apiPost("/api/admin/cashier/payment-method-add", { name: addMethod }, token);
      setAddMethod("");
      loadPaymentMethods();
    } catch { toast.error("Failed"); }
  };

  const editCompanyInfoSubmit = async () => {
    if (!token) return;
    setSubmitted(true);
    try {
      await apiPost("/api/branch/cashier/save_company_info", companyInfo, token);
      toast.success("Company info updated");
      setSubmitted(false);
    } catch { toast.error("Failed"); setSubmitted(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stockist and Branches</h1>
          <p className="text-muted-foreground">Manage stockist, branches, cashier and inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { loadPaymentMethods(); setManagePaymentOpen(true); }}>
            <CreditCard className="h-4 w-4 mr-2" /> Manage Cashier Payment Methods
          </Button>
          <Button variant="outline" onClick={() => { loadStockistLevels(); setManageStockistOpen(true); }}>
            <Layers className="h-4 w-4 mr-2" /> Manage Stockist Levels
          </Button>
          <Button variant="outline" onClick={() => { loadLocations(); setManageLocationOpen(true); }}>
            <MapPin className="h-4 w-4 mr-2" /> Manage Locations
          </Button>
          <Button variant="outline" onClick={() => { loadCompanyInfo(); setCompanyOpen(true); }}>
            <Info className="h-4 w-4 mr-2" /> Edit Company Info
          </Button>
          <Button onClick={() => { setBranch({}); setAddBranchOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Branch / Stockist
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <select className="h-10 rounded-md border px-3 text-sm" value={filter.branch_type}
              onChange={(e) => setFilter(f => ({ ...f, branch_type: e.target.value }))}>
              <option value="all">All Type</option>
              <option value="Branch">Branch</option>
              <option value="Stockist">Stockist</option>
              <option value="Archived">Archived</option>
            </select>
            <select className="h-10 rounded-md border px-3 text-sm" value={filter.branch_location}
              onChange={(e) => setFilter(f => ({ ...f, branch_location: e.target.value }))}>
              <option value="all">All Locations</option>
              {locationList.map((l: any, i: number) => (
                <option key={i} value={l.location}>{l.location}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search branch name..."
                value={filter.search_key} onChange={(e) => setFilter(f => ({ ...f, search_key: e.target.value }))} />
            </div>
            <Button variant="outline" size="icon" onClick={loadBranchList}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {branchData === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-lg">No Record found</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stockist /<br />Branch Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">Branch / Stockist<br />Cashier Count</TableHead>
                      <TableHead className="text-center">Available<br />Membership Code</TableHead>
                      <TableHead className="text-center">Available<br />Product Code</TableHead>
                      <TableHead className="text-center">Sold<br />Membership Code</TableHead>
                      <TableHead className="text-center">Sold<br />Product Code</TableHead>
                      <TableHead className="text-right">Total<br />Sale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchList.map((branch: any, i: number) => (
                      <TableRow key={branch.branch_id || i} className="cursor-pointer hover:bg-muted/50"
                        onClick={() => editBranch(branch.branch_id)}>
                        <TableCell className="font-medium">{branch.branch_name}</TableCell>
                        <TableCell>{branch.branch_location}</TableCell>
                        <TableCell>{branch.branch_type}{branch.branch_type === "Stockist" ? `(${branch.stockist_level_name})` : ""}</TableCell>
                        <TableCell className="text-center">{branch.cashier_count}</TableCell>
                        <TableCell className="text-center">{branch.membership_codes_count}</TableCell>
                        <TableCell className="text-center">{branch.product_codes_count}</TableCell>
                        <TableCell className="text-center">{branch.sold_membership_quantity}</TableCell>
                        <TableCell className="text-center">{branch.sold_product_quantity}</TableCell>
                        <TableCell className="text-right">{(Number(branch.total_sales) || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <tfoot>
                    <TableRow className="font-bold">
                      <TableHead colSpan={8}></TableHead>
                      <TableHead className="text-right text-blue-600">{totalSales.toFixed(2)}</TableHead>
                    </TableRow>
                  </tfoot>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Branch/Stockist Modal */}
      <Dialog open={addBranchOpen} onOpenChange={setAddBranchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><Plus className="h-5 w-5 inline mr-2" /> Add New Branch / Stockist</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Enter Branch Name</Label>
              <Input value={branch.branch_name || ""} onChange={(e) => setBranch((p: any) => ({ ...p, branch_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={branch.branch_location || ""}
                onChange={(e) => setBranch((p: any) => ({ ...p, branch_location: e.target.value }))}>
                <option value="">Select Location</option>
                {locationList.map((l: any, i: number) => (
                  <option key={i} value={l.location}>{l.location}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={branch.branch_type || "Branch"}
                onChange={(e) => setBranch((p: any) => ({ ...p, branch_type: e.target.value }))}>
                <option value="Branch">Branch</option>
                <option value="Stockist">Stockist</option>
              </select>
            </div>
            {branch.branch_type === "Stockist" && (
              <>
                <div className="space-y-1">
                  <Label>Stockist Level</Label>
                  <select className="w-full h-10 rounded-md border px-3 text-sm" value={branch.stockist_level || ""}
                    onChange={(e) => setBranch((p: any) => ({ ...p, stockist_level: e.target.value }))}>
                    {stockistList.map((l: any, i: number) => (
                      <option key={i} value={l.stockist_level_id}>{l.stockist_level_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Stockist Email</Label>
                  <Input type="email" value={branch.branch_email || ""} onChange={(e) => setBranch((p: any) => ({ ...p, branch_email: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Stockist First Name</Label>
                  <Input value={branch.branch_first_name || ""} onChange={(e) => setBranch((p: any) => ({ ...p, branch_first_name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Stockist Last Name</Label>
                  <Input value={branch.branch_last_name || ""} onChange={(e) => setBranch((p: any) => ({ ...p, branch_last_name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Stockist Contact Number</Label>
                  <Input type="number" value={branch.branch_contact || ""} onChange={(e) => setBranch((p: any) => ({ ...p, branch_contact: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Stockist Password</Label>
                  <Input type="password" value={branch.branch_password || ""} onChange={(e) => setBranch((p: any) => ({ ...p, branch_password: e.target.value }))} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBranchOpen(false)}>Close</Button>
            <Button onClick={branchSubmit} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving</> : <><Save className="h-4 w-4 mr-2" /> Save New {branch.branch_type === "Stockist" ? "Stockist" : "Branch"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Modal */}
      <Dialog open={editBranchOpen} onOpenChange={(o) => { if (!o) { setEditBranchOpen(false); setRowClicked(null); } }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle><MapPin className="h-5 w-5 inline mr-2" /> Manage Branch ({data?.branch_name})</DialogTitle>
          </DialogHeader>
          {data && (
            <Tabs value={editTab} onValueChange={setEditTab}>
              <TabsList>
                <TabsTrigger value="information"><Info className="h-4 w-4 mr-2" /> Information</TabsTrigger>
                <TabsTrigger value="cashiers"><Users className="h-4 w-4 mr-2" /> Cashier and Managers</TabsTrigger>
                <TabsTrigger value="inventory"><Package className="h-4 w-4 mr-2" /> Inventory and Codes</TabsTrigger>
              </TabsList>

              <TabsContent value="information" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Branch Name</Label>
                    <Input value={data.branch_name || ""} onChange={(e) => setData((p: any) => ({ ...p, branch_name: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Branch Location</Label>
                    <select className="w-full h-10 rounded-md border px-3 text-sm" value={data.branch_location || ""}
                      onChange={(e) => setData((p: any) => ({ ...p, branch_location: e.target.value }))}>
                      {locationList.map((l: any, i: number) => (
                        <option key={i} value={l.location}>{l.location}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Branch Type</Label>
                    <select disabled className="w-full h-10 rounded-md border px-3 text-sm" value={data.branch_type || "Branch"}>
                      <option>Branch</option>
                      <option>Stockist</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Custom Username</Label>
                    <select className="w-full h-10 rounded-md border px-3 text-sm" value={data.custom_code ?? "1"}
                      onChange={(e) => setData((p: any) => ({ ...p, custom_code: e.target.value }))}>
                      <option value="1">Enabled</option>
                      <option value="0">Disabled</option>
                    </select>
                  </div>
                  {data.branch_type === "Stockist" && (
                    <>
                      <div className="space-y-1">
                        <Label>Stockist Level</Label>
                        <select className="w-full h-10 rounded-md border px-3 text-sm" value={data.stockist_level || ""}
                          onChange={(e) => setData((p: any) => ({ ...p, stockist_level: e.target.value }))}>
                          {stockistList.map((l: any, i: number) => (
                            <option key={i} value={l.stockist_level_id}>{l.stockist_level_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label>Stockist Email</Label>
                        <Input value={data.email || ""} onChange={(e) => setData((p: any) => ({ ...p, email: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Stockist First Name</Label>
                        <Input value={data.first_name || ""} onChange={(e) => setData((p: any) => ({ ...p, first_name: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Stockist Last Name</Label>
                        <Input value={data.last_name || ""} onChange={(e) => setData((p: any) => ({ ...p, last_name: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Stockist Contact Number</Label>
                        <Input type="number" value={data.contact || ""} onChange={(e) => setData((p: any) => ({ ...p, contact: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Stockist Password</Label>
                        <Input type="password" value={data.pass || ""} onChange={(e) => setData((p: any) => ({ ...p, pass: e.target.value }))} />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditBranchOpen(false)}>Cancel</Button>
                  {data.archived === 1 ? (
                    <Button variant="secondary" onClick={() => restoreBranch(data.branch_id)} disabled={submitted}>
                      <Undo className="h-4 w-4 mr-2" /> Restore
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={() => archiveBranch(data.branch_id)} disabled={submitted}>
                      <Trash2 className="h-4 w-4 mr-2" /> Archive
                    </Button>
                  )}
                  <Button onClick={updateBranch} disabled={submitted}>
                    {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving</> : <><Save className="h-4 w-4 mr-2" /> Update Information</>}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="cashiers" className="space-y-4 mt-4">
                <div className="flex gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <select className="h-10 rounded-md border px-3 text-sm" value={cashierFilter.status}
                      onChange={(e) => { setCashierFilter(f => ({ ...f, status: e.target.value })); loadCashiers(); }}>
                      <option value="all">All Status</option>
                      <option value="Active">Active Only</option>
                      <option value="Pending">Pending Only</option>
                      <option value="Blocked">Blocked Only</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Position</Label>
                    <select className="h-10 rounded-md border px-3 text-sm" value={cashierFilter.position}
                      onChange={(e) => { setCashierFilter(f => ({ ...f, position: e.target.value })); loadCashiers(); }}>
                      <option value="all">All Positions</option>
                      <option value="Manager">Manager</option>
                      <option value="Cashier">Cashier</option>
                    </select>
                  </div>
                  <Button size="sm" variant="outline" onClick={async () => {
                    if (!token) return;
                    try {
                      const res = await apiPost<any>("/api/admin/cashier/access-list", { branch_id: data.branch_id }, token);
                      setCashierAccessList(res);
                      setCashierAccessOpen(true);
                    } catch { toast.error("Failed"); }
                  }}>
                    <Settings className="h-4 w-4 mr-2" /> Manage Access
                  </Button>
                  <Button size="sm" onClick={() => { setCashier({}); setAddCashierOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Cashier/Manager
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>E-Mail</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashierList.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No cashiers found</TableCell></TableRow>
                      ) : (
                        cashierList.map((c: any, i: number) => (
                          <TableRow key={i} className="cursor-pointer hover:bg-muted/50"
                            onClick={() => { setCashierInfo(c); setEditCashierOpen(true); }}>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>{c.email}</TableCell>
                            <TableCell>{c.cashier_position}</TableCell>
                            <TableCell>{c.cashier_address}</TableCell>
                            <TableCell>
                              <Badge variant={c.cashier_status === "Active" ? "default" : "secondary"}
                                className={c.cashier_status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {c.cashier_status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4 mt-4">
                <div className="flex justify-end gap-2">
                  <a href={`/api/export/admin/inventory/xls?branch_id=${data.branch_id}`} target="_blank"
                    className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-accent">
                    <FileSpreadsheet className="h-4 w-4 mr-2" /> Export Inventory (Excel)
                  </a>
                  <a href={`/api/export/admin/inventory/pdf?branch_id=${data.branch_id}`} target="_blank"
                    className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-accent">
                    <FileText className="h-4 w-4 mr-2" /> Export Inventory (PDF)
                  </a>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product SKU</TableHead>
                        <TableHead>Product Description</TableHead>
                        <TableHead className="text-right">Selling Price</TableHead>
                        <TableHead className="text-center">Qty<br />Sold</TableHead>
                        <TableHead className="text-center">Qty<br />Used</TableHead>
                        <TableHead className="text-center">Qty<br />Available</TableHead>
                        <TableHead className="text-center">Qty<br />Unclaimed</TableHead>
                        <TableHead className="text-center">Qty<br />Claimed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productList.length === 0 ? (
                        <TableRow><TableCell colSpan={8} className="text-center py-4 text-muted-foreground">No products</TableCell></TableRow>
                      ) : (
                        productList.map((prod: any, i: number) => (
                          <TableRow key={i} className={`cursor-pointer ${rowClicked === i ? "bg-muted" : "hover:bg-muted/50"}`}
                            onClick={() => selectItem(prod.item_id, prod.item_sku, i)}>
                            <TableCell>{prod.item_sku}</TableCell>
                            <TableCell>{prod.item_description}</TableCell>
                            <TableCell className="text-right">{prod.item_price}</TableCell>
                            <TableCell className="text-center">{prod.sold_codes}</TableCell>
                            <TableCell className="text-center">{prod.used_codes}</TableCell>
                            <TableCell className="text-center">{prod.inventory_quantity}</TableCell>
                            <TableCell className="text-center">{prod.unclaimed}</TableCell>
                            <TableCell className="text-center">{prod.claimed}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {codeSelect.item_sku && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Code List for {codeSelect.item_sku}</h4>
                    <div className="flex gap-2">
                      <select className="h-10 rounded-md border px-3 text-sm" value={codeFilter.status}
                        onChange={(e) => { setCodeFilter(f => ({ ...f, status: e.target.value })); }}>
                        <option value="all">Show All Codes</option>
                        <option value="Used">Used Codes Only</option>
                        <option value="Unused">Unused Code Only</option>
                        <option value="Sold">Sold Codes Only</option>
                        <option value="Unsold">Unsold Codes Only</option>
                      </select>
                      <Input className="flex-1" placeholder="Search for code" value={codeFilter.search}
                        onChange={(e) => setCodeFilter(f => ({ ...f, search: e.target.value }))} />
                      <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-2" /> Export to Excel</Button>
                    </div>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Pin</TableHead>
                            <TableHead>Sold to</TableHead>
                            <TableHead>Used on Slot</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {codeList.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No codes</TableCell></TableRow>
                          ) : (
                            codeList.slice((p - 1) * 5, p * 5).map((code: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell>{code.code_activation}</TableCell>
                                <TableCell>{code.code_pin}</TableCell>
                                <TableCell>{code.code_buyer?.name || "Not Sold"}</TableCell>
                                <TableCell>{code.code_user?.name || "Unused"}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditBranchOpen(false); setRowClicked(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Location Modal */}
      <Dialog open={manageLocationOpen} onOpenChange={setManageLocationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><MapPin className="h-5 w-5 inline mr-2" /> Manage Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {locationList.map((loc: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={loc.location || ""} onChange={(e) => {
                  const upd = [...locationList];
                  upd[i] = { ...upd[i], location: e.target.value };
                  setLocationList(upd);
                }} />
                <button type="button"
                  onClick={() => {
                    if (i === locationList.length - 1) {
                      setLocationList(prev => [...prev, { location: "" }]);
                    } else {
                      setLocationList(prev => prev.filter((_, idx) => idx !== i));
                    }
                  }}
                  className={`text-lg ${i === locationList.length - 1 ? "text-blue-500" : "text-red-500"}`}>
                  {i === locationList.length - 1 ? "+" : "×"}
                </button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageLocationOpen(false)}>Close</Button>
            <Button onClick={addLocationSubmit} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving</> : <><Save className="h-4 w-4 mr-2" /> Save & Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Stockist Levels Modal */}
      <Dialog open={manageStockistOpen} onOpenChange={setManageStockistOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><Layers className="h-5 w-5 inline mr-2" /> Manage Stockist Levels</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {stockistList.map((level: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={level.stockist_level_name || ""} onChange={(e) => {
                  const upd = [...stockistList];
                  upd[i] = { ...upd[i], stockist_level_name: e.target.value };
                  setStockistList(upd);
                }} />
                <button type="button"
                  onClick={() => {
                    if (i === stockistList.length - 1) {
                      setStockistList(prev => [...prev, { stockist_level_name: "" }]);
                    } else {
                      setStockistList(prev => prev.filter((_, idx) => idx !== i));
                    }
                  }}
                  className={`text-lg ${i === stockistList.length - 1 ? "text-blue-500" : "text-red-500"}`}>
                  {i === stockistList.length - 1 ? "+" : "×"}
                </button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageStockistOpen(false)}>Close</Button>
            <Button onClick={addStockistLevel} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving</> : <><Save className="h-4 w-4 mr-2" /> Save & Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Payment Methods Modal */}
      <Dialog open={managePaymentOpen} onOpenChange={setManagePaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><CreditCard className="h-5 w-5 inline mr-2" /> Payment Methods</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {paymentMethod.map((pm: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span>{pm.cashier_payment_method_name}</span>
                <input type="checkbox"
                  checked={pm.cashier_payment_method_status === 1}
                  onChange={() => {
                    const upd = [...paymentMethod];
                    upd[i] = { ...upd[i], cashier_payment_method_status: upd[i].cashier_payment_method_status === 1 ? 0 : 1 };
                    setPaymentMethod(upd);
                  }} />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input placeholder="New method name" value={addMethod} onChange={(e) => setAddMethod(e.target.value)} />
              <Button size="sm" onClick={addPaymentMethod}>Add Method</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManagePaymentOpen(false)}>Close</Button>
            <Button onClick={selectedPayment} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving</> : <><Save className="h-4 w-4 mr-2" /> Save & Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Cashier/Manager Modal */}
      <Dialog open={addCashierOpen} onOpenChange={setAddCashierOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><Plus className="h-5 w-5 inline mr-2" /> Cashier Info</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Full Name Here</Label>
              <Input value={cashier.full_name || ""} onChange={(e) => setCashier((p: any) => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={cashier.email || ""} onChange={(e) => setCashier((p: any) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" value={cashier.password || ""} onChange={(e) => setCashier((p: any) => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Confirm Password</Label>
              <Input type="password" value={cashier.password_confirm || ""} onChange={(e) => setCashier((p: any) => ({ ...p, password_confirm: e.target.value }))} />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Address</Label>
              <Input value={cashier.address || ""} onChange={(e) => setCashier((p: any) => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Contact Number</Label>
              <Input value={cashier.contact_number || ""} onChange={(e) => setCashier((p: any) => ({ ...p, contact_number: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Position</Label>
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={cashier.position || "Manager"}
                onChange={(e) => setCashier((p: any) => ({ ...p, position: e.target.value }))}>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={cashier.status || "Active"}
                onChange={(e) => setCashier((p: any) => ({ ...p, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCashierOpen(false)}>Close</Button>
            <Button onClick={cashierAdd} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving</> : <><Save className="h-4 w-4 mr-2" /> Save & Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cashier Modal */}
      <Dialog open={editCashierOpen} onOpenChange={setEditCashierOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><Users className="h-5 w-5 inline mr-2" /> Edit Cashier Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Cashier's Name</Label>
              <Input value={cashierInfo.name || ""} onChange={(e) => setCashierInfo((p: any) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input value={cashierInfo.cashier_address || ""} onChange={(e) => setCashierInfo((p: any) => ({ ...p, cashier_address: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={cashierInfo.email || ""} onChange={(e) => setCashierInfo((p: any) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" value={cashierInfo.decrypted_password || ""} onChange={(e) => setCashierInfo((p: any) => ({ ...p, decrypted_password: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Position</Label>
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={cashierInfo.cashier_position || "Cashier"}
                onChange={(e) => setCashierInfo((p: any) => ({ ...p, cashier_position: e.target.value }))}>
                <option value="Cashier">Cashier</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select className="w-full h-10 rounded-md border px-3 text-sm" value={cashierInfo.cashier_status || "Active"}
                onChange={(e) => setCashierInfo((p: any) => ({ ...p, cashier_status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCashierOpen(false)}>Close</Button>
            <Button onClick={() => editCashierSubmit(cashierInfo.cashier_id)} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving</> : <><Save className="h-4 w-4 mr-2" /> Save & Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cashier Access Modal */}
      <Dialog open={cashierAccessOpen} onOpenChange={setCashierAccessOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><Settings className="h-5 w-5 inline mr-2" /> Cashier Access</DialogTitle>
          </DialogHeader>
          {cashierAccessList && ["stockist", "manager", "cashier"].filter(r => cashierAccessList[r]).map((role) => (
            <div key={role} className="mb-4">
              <h4 className="font-semibold capitalize mb-2">{role}</h4>
              <div className="space-y-2">
                {["add_member", "create_slot", "overall_discount"].map((feat) => (
                  <div key={feat} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{feat.replace(/_/g, " ")}</span>
                    <input type="checkbox"
                      checked={cashierAccessList[role][feat] === 1}
                      onChange={() => {
                        setCashierAccessList((prev: any) => ({
                          ...prev,
                          [role]: { ...prev[role], [feat]: prev[role][feat] === 1 ? 0 : 1 },
                        }));
                      }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCashierAccessOpen(false)}>Close</Button>
            <Button onClick={accessListSubmit} disabled={submitted}>
              {submitted ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating</> : <><CheckCircle className="h-4 w-4 mr-2" /> Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Info Modal */}
      <Dialog open={companyOpen} onOpenChange={setCompanyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><Building2 className="h-5 w-5 inline mr-2" /> Company Info</DialogTitle>
          </DialogHeader>
          <div className="font-semibold mb-4">Edit Company Info</div>
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
                  <Input type={f.type || "text"} value={companyInfo[f.key] || ""}
                    onChange={(e) => setCompanyInfo((prev: any) => ({ ...prev, [f.key]: e.target.value }))} />
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
    </div>
  );
}
