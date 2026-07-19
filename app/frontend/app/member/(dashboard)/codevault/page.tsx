"use client";

import { useEffect, useState, useCallback } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2, Lock, Copy, Send, Key, ArrowRightLeft,
  ChevronLeft, ChevronRight, Search, Package, ShieldCheck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface CodeItem {
  code_id: number;
  code_activation: string;
  code_pin: string;
  code_date_sold?: string;
  code_date_used?: string;
  code_status?: string;
  used_by_name?: string;
  slot_no?: string;
  slot_qty?: number;
  item_name?: string;
  membership_name?: string;
  [key: string]: any;
}

interface PaginatedCodes {
  code_list?: { data: CodeItem[]; current_page: number; last_page: number; total: number };
  code_count?: number;
  [key: string]: any;
}

interface TransferHistoryItem {
  id: number;
  code_activation?: string;
  code_pin?: string;
  transfer_from_name?: string;
  transfer_to_name?: string;
  transfer_date?: string;
  transfer_from_slot?: string;
  transfer_to_slot?: string;
  [key: string]: any;
}

interface UserSearchResult {
  id: number;
  name: string;
  email: string;
}

interface SlotResult {
  slot_id: number;
  slot_no: string;
  slot_type?: string;
  membership_name?: string;
  [key: string]: any;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function MemberCodevaultPage() {
  const { token, currentSlot } = useAuthStore();
  const slotId = currentSlot?.slot_id;

  // ---------- Showing settings ----------
  const [showMembership, setShowMembership] = useState(true);
  const [showProduct, setShowProduct] = useState(true);
  const [activeTab, setActiveTab] = useState("membership");
  const [loading, setLoading] = useState(true);

  // ---------- Membership codes ----------
  const [membershipCodes, setMembershipCodes] = useState<PaginatedCodes | null>(null);
  const [memberFilter, setMemberFilter] = useState({ status: "all", filter: "all", page: 1 });

  // ---------- Product codes ----------
  const [productCodes, setProductCodes] = useState<PaginatedCodes | null>(null);
  const [productFilter, setProductFilter] = useState({ status: "all", filter: "all", page: 1 });

  // ---------- Transfer history ----------
  const [transferHistory, setTransferHistory] = useState<{ data: TransferHistoryItem[]; current_page: number; last_page: number } | null>(null);
  const [historyPage, setHistoryPage] = useState(1);

  // ---------- Transfer dialog ----------
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<CodeItem | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [userSlots, setUserSlots] = useState<SlotResult[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [transferring, setTransferring] = useState(false);

  // ---------- Activate product dialog ----------
  const [activateOpen, setActivateOpen] = useState(false);
  const [activateCode, setActivateCode] = useState<CodeItem | null>(null);
  const [activating, setActivating] = useState(false);

  // ---------- Permission flags ----------
  const [allowTransferCode, setAllowTransferCode] = useState(false);

  /* ================================================================ */
  /*  Data fetching                                                    */
  /* ================================================================ */

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost("/api/member/get_showing_settings", {}, token);
      if (res) {
        const showSlot = res.show_slot_code === 1;
        const showProd = res.show_product_code === 1;
        setShowMembership(showSlot);
        setShowProduct(showProd);
        if (showSlot) setActiveTab("membership");
        else if (showProd) setActiveTab("product");
        else setActiveTab("history");
      }
    } catch { /* ignore */ }
  }, [token]);

  const loadMembershipCodes = useCallback(async (filters?: typeof memberFilter) => {
    if (!token || !slotId) return;
    const f = filters || memberFilter;
    try {
      const res = await apiPost("/api/load_membership_code", {
        slot_id: slotId,
        code_owner: currentSlot?.logged_id || currentSlot?.user_id,
        status: f.status,
        filter: f.filter,
        page: f.page,
      }, token);
      if (res) setMembershipCodes(res);
    } catch { /* ignore */ }
  }, [token, slotId, currentSlot, memberFilter]);

  const loadProductCodes = useCallback(async (filters?: typeof productFilter) => {
    if (!token || !slotId) return;
    const f = filters || productFilter;
    try {
      const res = await apiPost("/api/load_product_code", {
        slot_id: slotId,
        code_owner: currentSlot?.logged_id || currentSlot?.user_id,
        status: f.status,
        filter: f.filter,
        page: f.page,
      }, token);
      if (res) setProductCodes(res);
    } catch { /* ignore */ }
  }, [token, slotId, currentSlot, productFilter]);

  const loadTransferHistory = useCallback(async (page?: number) => {
    if (!token || !slotId) return;
    try {
      const res = await apiPost("/api/load_transfer_history_code", {
        slot_id: slotId,
        page: page ?? historyPage,
      }, token);
      if (res) setTransferHistory(res);
    } catch { /* ignore */ }
  }, [token, slotId, historyPage]);

  const loadPermissions = useCallback(async () => {
    if (!currentSlot) return;
    setAllowTransferCode(!!currentSlot.module_settings?.code_transfer);
  }, [currentSlot]);

  // Initial load
  useEffect(() => {
    if (!token || !slotId) return;
    const init = async () => {
      setLoading(true);
      await fetchSettings();
      await Promise.all([
        loadMembershipCodes(),
        loadProductCodes(),
        loadTransferHistory(),
      ]);
      loadPermissions();
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, slotId]);

  /* ================================================================ */
  /*  Transfer flow                                                    */
  /* ================================================================ */

  const searchUsers = async () => {
    if (!userSearch.trim()) return;
    try {
      const res = await apiPost("/api/member/user_search", { user_search: userSearch }, token);
      if (Array.isArray(res)) setUserResults(res);
      else if (res?.data) setUserResults(res.data);
    } catch { /* ignore */ }
  };

  const selectUser = async (userId: number, name: string) => {
    setUserSearch(name);
    setUserResults([]);
    try {
      const res = await apiPost("/api/member/select_user", { user_id: userId }, token);
      if (Array.isArray(res)) setUserSlots(res);
      else if (res?.data) setUserSlots(res.data);
    } catch { /* ignore */ }
  };

  const submitTransfer = async () => {
    if (!selectedSlot || !selectedCode) {
      toast.error("Please select a recipient slot.");
      return;
    }
    setTransferring(true);
    try {
      const res = await apiPost("/api/member/transfer_code", {
        transfer_to: selectedSlot,
        code_id: selectedCode.code_id,
        transfer_from: slotId,
      }, token);
      if (res?.status === "success") {
        toast.success(res.status_message || "Code transferred successfully!");
        setTransferOpen(false);
        resetTransferState();
        loadMembershipCodes();
        loadProductCodes();
        loadTransferHistory();
      } else {
        toast.error(res?.status_message || "Transfer failed.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Transfer failed.");
    }
    setTransferring(false);
  };

  const resetTransferState = () => {
    setSelectedCode(null);
    setSelectedSlot(null);
    setUserSearch("");
    setUserResults([]);
    setUserSlots([]);
  };

  /* ================================================================ */
  /*  Activate product code                                            */
  /* ================================================================ */

  const submitActivateProduct = async () => {
    if (!activateCode) return;
    setActivating(true);
    try {
      const res = await apiPost("/api/member/activate_product_code", {
        slot_id: slotId,
        code: activateCode.code_activation,
        pin: activateCode.code_pin,
        code_id: activateCode.code_id,
      }, token);
      if (res?.status === "success") {
        toast.success(res.message || "Product code activated!");
        setActivateOpen(false);
        setActivateCode(null);
        loadProductCodes();
      } else {
        toast.error(res?.message || "Activation failed.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Activation failed.");
    }
    setActivating(false);
  };

  /* ================================================================ */
  /*  Helpers                                                          */
  /* ================================================================ */

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  const getStatusBadge = (code: CodeItem) => {
    if (code.code_date_used) return <Badge>Used</Badge>;
    if (code.code_status === "transferred") return <Badge variant="outline">Transferred</Badge>;
    return <Badge variant="secondary">Available</Badge>;
  };

  const memberCodeList = membershipCodes?.code_list?.data || [];
  const memberPages = membershipCodes?.code_list?.last_page || 1;
  const productCodeList = productCodes?.code_list?.data || [];
  const productPages = productCodes?.code_list?.last_page || 1;
  const historyList = transferHistory?.data || (Array.isArray(transferHistory) ? transferHistory as unknown as TransferHistoryItem[] : []);
  const historyPages = transferHistory?.last_page || 1;

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
        <Key className="h-6 w-6" /> Code Vault
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {showMembership && <TabsTrigger value="membership">Membership Codes</TabsTrigger>}
          {showProduct && <TabsTrigger value="product">Product Codes</TabsTrigger>}
          <TabsTrigger value="history">Transfer History</TabsTrigger>
        </TabsList>

        {/* ========== MEMBERSHIP CODES TAB ========== */}
        {showMembership && (
          <TabsContent value="membership" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select
                  value={memberFilter.status}
                  onValueChange={(v) => {
                    const f = { ...memberFilter, status: v, page: 1 };
                    setMemberFilter(f);
                    loadMembershipCodes(f);
                  }}
                >
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Filter</Label>
                <Select
                  value={memberFilter.filter}
                  onValueChange={(v) => {
                    const f = { ...memberFilter, filter: v, page: 1 };
                    setMemberFilter(f);
                    loadMembershipCodes(f);
                  }}
                >
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Code table */}
            <Card>
              <CardContent className="p-0">
                {memberCodeList.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    No membership codes found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Pin</TableHead>
                          <TableHead>Membership</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Used By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {memberCodeList.map((code) => (
                          <TableRow key={code.code_id}>
                            <TableCell className="font-mono text-xs">{code.code_activation}</TableCell>
                            <TableCell className="font-mono text-xs">{code.code_pin || "-"}</TableCell>
                            <TableCell className="text-sm">{code.membership_name || code.item_name || "-"}</TableCell>
                            <TableCell>{getStatusBadge(code)}</TableCell>
                            <TableCell className="text-sm">{code.used_by_name || code.slot_no || "-"}</TableCell>
                            <TableCell className="text-sm">
                              {code.code_date_sold ? new Date(code.code_date_sold).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => copyCode(code.code_activation)}
                                  title="Copy code">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                {!code.code_date_used && allowTransferCode && (
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedCode(code);
                                    setTransferOpen(true);
                                  }} title="Transfer code">
                                    <Send className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {memberPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={memberFilter.page <= 1}
                  onClick={() => {
                    const f = { ...memberFilter, page: memberFilter.page - 1 };
                    setMemberFilter(f);
                    loadMembershipCodes(f);
                  }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">Page {memberFilter.page} of {memberPages}</span>
                <Button variant="outline" size="sm" disabled={memberFilter.page >= memberPages}
                  onClick={() => {
                    const f = { ...memberFilter, page: memberFilter.page + 1 };
                    setMemberFilter(f);
                    loadMembershipCodes(f);
                  }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>
        )}

        {/* ========== PRODUCT CODES TAB ========== */}
        {showProduct && (
          <TabsContent value="product" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select
                  value={productFilter.status}
                  onValueChange={(v) => {
                    const f = { ...productFilter, status: v, page: 1 };
                    setProductFilter(f);
                    loadProductCodes(f);
                  }}
                >
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Filter</Label>
                <Select
                  value={productFilter.filter}
                  onValueChange={(v) => {
                    const f = { ...productFilter, filter: v, page: 1 };
                    setProductFilter(f);
                    loadProductCodes(f);
                  }}
                >
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Code table */}
            <Card>
              <CardContent className="p-0">
                {productCodeList.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    No product codes found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Pin</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Used By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productCodeList.map((code) => (
                          <TableRow key={code.code_id}>
                            <TableCell className="font-mono text-xs">{code.code_activation}</TableCell>
                            <TableCell className="font-mono text-xs">{code.code_pin || "-"}</TableCell>
                            <TableCell className="text-sm">{code.item_name || "-"}</TableCell>
                            <TableCell>{getStatusBadge(code)}</TableCell>
                            <TableCell className="text-sm">{code.used_by_name || code.slot_no || "-"}</TableCell>
                            <TableCell className="text-sm">
                              {code.code_date_sold ? new Date(code.code_date_sold).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm"
                                  onClick={() => copyCode(code.code_activation)}
                                  title="Copy code">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                {!code.code_date_used && (
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setActivateCode(code);
                                    setActivateOpen(true);
                                  }} title="Activate code">
                                    <ShieldCheck className="h-3 w-3" />
                                  </Button>
                                )}
                                {!code.code_date_used && allowTransferCode && (
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedCode(code);
                                    setTransferOpen(true);
                                  }} title="Transfer code">
                                    <Send className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {productPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={productFilter.page <= 1}
                  onClick={() => {
                    const f = { ...productFilter, page: productFilter.page - 1 };
                    setProductFilter(f);
                    loadProductCodes(f);
                  }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">Page {productFilter.page} of {productPages}</span>
                <Button variant="outline" size="sm" disabled={productFilter.page >= productPages}
                  onClick={() => {
                    const f = { ...productFilter, page: productFilter.page + 1 };
                    setProductFilter(f);
                    loadProductCodes(f);
                  }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>
        )}

        {/* ========== TRANSFER HISTORY TAB ========== */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowRightLeft className="h-4 w-4" /> Transfer History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {historyList.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <ArrowRightLeft className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  No transfer history yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyList.map((item, i) => (
                        <TableRow key={item.id || i}>
                          <TableCell className="font-mono text-xs">
                            {item.code_activation || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.transfer_from_name || item.transfer_from_slot || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.transfer_to_name || item.transfer_to_slot || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.transfer_date
                              ? new Date(item.transfer_date).toLocaleDateString()
                              : item.created_at
                                ? new Date(item.created_at).toLocaleDateString()
                                : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {historyPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={historyPage <= 1}
                onClick={() => {
                  const p = historyPage - 1;
                  setHistoryPage(p);
                  loadTransferHistory(p);
                }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {historyPage} of {historyPages}</span>
              <Button variant="outline" size="sm" disabled={historyPage >= historyPages}
                onClick={() => {
                  const p = historyPage + 1;
                  setHistoryPage(p);
                  loadTransferHistory(p);
                }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ========== TRANSFER CODE DIALOG ========== */}
      <Dialog open={transferOpen} onOpenChange={(open) => {
        setTransferOpen(open);
        if (!open) resetTransferState();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Code</DialogTitle>
            <DialogDescription>
              Search for a member and select their slot to transfer this code.
            </DialogDescription>
          </DialogHeader>

          {selectedCode && (
            <div className="bg-muted rounded p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Code:</span>{" "}
                <span className="font-mono">{selectedCode.code_activation}</span></p>
              <p><span className="text-muted-foreground">Pin:</span>{" "}
                <span className="font-mono">{selectedCode.code_pin}</span></p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search Member</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                />
                <Button variant="outline" onClick={searchUsers}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* User search results */}
            {userResults.length > 0 && (
              <div className="border rounded max-h-32 overflow-y-auto divide-y">
                {userResults.map((u) => (
                  <button
                    key={u.id}
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm transition-colors"
                    onClick={() => selectUser(u.id, u.name)}
                  >
                    <span className="font-medium">{u.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{u.email}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Slot selection */}
            {userSlots.length > 0 && (
              <div className="space-y-2">
                <Label>Select Slot</Label>
                <div className="border rounded max-h-40 overflow-y-auto divide-y">
                  {userSlots.map((slot) => (
                    <button
                      key={slot.slot_id}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        selectedSlot === slot.slot_id
                          ? "bg-green-50 dark:bg-green-950 border-l-2 border-green-600"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedSlot(slot.slot_id)}
                    >
                      <span className="font-mono">{slot.slot_no}</span>
                      {slot.membership_name && (
                        <Badge variant="outline" className="ml-2 text-xs">{slot.membership_name}</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setTransferOpen(false); resetTransferState(); }}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={!selectedSlot || transferring}
              onClick={submitTransfer}
            >
              {transferring ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== ACTIVATE PRODUCT CODE DIALOG ========== */}
      <Dialog open={activateOpen} onOpenChange={(open) => {
        setActivateOpen(open);
        if (!open) setActivateCode(null);
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Activate Product Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to activate this product code?
            </DialogDescription>
          </DialogHeader>

          {activateCode && (
            <div className="bg-muted rounded p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Code:</span>{" "}
                <span className="font-mono">{activateCode.code_activation}</span></p>
              <p><span className="text-muted-foreground">Pin:</span>{" "}
                <span className="font-mono">{activateCode.code_pin}</span></p>
              {activateCode.item_name && (
                <p><span className="text-muted-foreground">Product:</span> {activateCode.item_name}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActivateOpen(false); setActivateCode(null); }}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={activating}
              onClick={submitActivateProduct}
            >
              {activating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
