"use client";

import { useEffect, useState, useCallback } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Network, List, Grid3X3, LayoutGrid, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "sonner";

/* ─── helpers ─── */
function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true });
}
function initials(name?: string) {
  if (!name) return "??";
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

/* ─── tree node component (reusable for binary / matrix / board) ─── */
function TreeNodeCard({ node, onExpand, settings }: { node: any; onExpand: (id: number) => void; settings?: any }) {
  if (!node) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground">Empty</div>
      </div>
    );
  }
  const s = node.settings || settings || {};
  const bgColor = node.color && node.color !== "#ffffff" ? { backgroundColor: node.color } : {};

  return (
    <div className="flex flex-col items-center">
      <button onClick={() => onExpand(node.slot_id)} className="flex flex-col items-center group cursor-pointer" title={`Click to expand ${node.slot_no}`}>
        <Avatar className="h-12 w-12 border-2 border-green-500 group-hover:border-green-600 transition-colors" style={bgColor}>
          {node.profile_picture ? <AvatarImage src={node.profile_picture} alt={node.slot_no} /> : null}
          <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">{initials(node.first_name ? `${node.first_name} ${node.last_name}` : node.name)}</AvatarFallback>
        </Avatar>
        {s.show_slot_no !== 0 && <p className="text-[10px] font-bold mt-0.5">{node.slot_no}</p>}
        {s.show_full_name === 1 && <p className="text-[9px] text-muted-foreground truncate max-w-20">{node.first_name} {node.last_name}</p>}
        {s.show_membership === 1 && node.membership_name && <Badge variant="outline" className="text-[8px] px-1">{node.membership_name}</Badge>}
      </button>
      {/* Tooltip-style detail */}
      <div className="hidden group-hover:block absolute z-50 bg-popover border rounded-md shadow-md p-2 text-xs w-52 -mt-2">
        {s.show_date_joined === 1 && <p>Date: {formatDate(node.slot_date_created)}</p>}
        {s.show_directs_no === 1 && <p>Direct: {node.total_recruits ?? 0}</p>}
        {s.show_maintenance_pv === 1 && <p>Maintenance PV: {node.slot_personal_spv}</p>}
        {s.show_binary_points === 1 && (
          <>
            <p>Left Points: {node.slot_left_points}/{node.accumulated_left_points}</p>
            <p>Right Points: {node.slot_right_points}/{node.accumulated_right_points}</p>
          </>
        )}
        {s.show_sponsor_username === 1 && <p>Sponsor: {node.sponsor_username}</p>}
      </div>
    </div>
  );
}

/* ─── Binary / Matrix / Board Tree View (recursive expand on click) ─── */
function TreeView({ type, rootSlotId, token }: { type: "placement" | "matrix" | "board"; rootSlotId: number; token: string | null }) {
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [searchSlot, setSearchSlot] = useState("");
  const [viewRootId, setViewRootId] = useState(rootSlotId);
  const [boardLevel, setBoardLevel] = useState(1);
  const { currentSlot } = useAuthStore();

  const endpoint = type === "placement" ? "/api/member/genealogy/placement" : type === "matrix" ? "/api/member/genealogy/matrix" : "/api/member/genealogy/board";

  const fetchTree = useCallback(async (slotId: number) => {
    setLoading(true);
    try {
      const body: any = { placement: slotId, root_slot: rootSlotId };
      if (type === "board") body.board_level = boardLevel;
      const res = await apiPost(endpoint, body, token);
      if (res) {
        setTree(res);
        const countKey = type === "matrix" ? "matrix_count" : "binary_count";
        if (res[countKey]) {
          setLeftCount(res[countKey].left || 0);
          setRightCount(res[countKey].right || 0);
        }
      }
    } catch { /* */ }
    setLoading(false);
  }, [rootSlotId, boardLevel, token, endpoint, type]);

  useEffect(() => { if (viewRootId) fetchTree(viewRootId); }, [viewRootId, boardLevel]);
  useEffect(() => { setViewRootId(rootSlotId); }, [rootSlotId]);

  const handleExpand = (slotId: number) => setViewRootId(slotId);
  const handleSearch = () => {
    if (searchSlot.trim()) {
      // Search needs to resolve slot_no → slot_id; for simplicity we pass to API
      setViewRootId(Number(searchSlot) || viewRootId);
    }
  };

  const countLabel = type === "matrix" ? "Matrix" : "Binary";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Go to slot ID..." value={searchSlot} onChange={e => setSearchSlot(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} className="w-40" />
        <Button variant="outline" size="sm" onClick={handleSearch}>Go</Button>
        {viewRootId !== rootSlotId && <Button variant="ghost" size="sm" onClick={() => setViewRootId(rootSlotId)}>Reset</Button>}
        {type === "board" && (
          <Select value={String(boardLevel)} onValueChange={v => setBoardLevel(Number(v))}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Board Level" /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(l => <SelectItem key={l} value={String(l)}>Level {l}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {(leftCount > 0 || rightCount > 0) && (
          <div className="flex gap-3 ml-auto text-xs">
            <Badge variant="secondary">Left: {leftCount}</Badge>
            <Badge variant="secondary">Right: {rightCount}</Badge>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : !tree ? (
        <p className="text-center text-muted-foreground py-10">No tree data available.</p>
      ) : (
        <Card>
          <CardContent className="pt-4 overflow-x-auto">
            <div className="min-w-[600px] flex flex-col items-center gap-4 py-4">
              {/* Root */}
              <TreeNodeCard node={{ slot_id: viewRootId, slot_no: tree.placement || currentSlot?.slot_no, ...tree.root, settings: tree.left?.settings || tree.right?.settings }} onExpand={handleExpand} />
              {/* Level 2 connector */}
              <div className="flex items-center gap-40">
                <div className="w-px h-6 bg-muted-foreground/30" />
                <div className="w-px h-6 bg-muted-foreground/30" />
              </div>
              {/* Level 2 */}
              <div className="flex gap-20">
                <TreeNodeCard node={tree.left} onExpand={handleExpand} />
                <TreeNodeCard node={tree.right} onExpand={handleExpand} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Unilevel Tree View ─── */
function UnilevelTree({ rootSlotId, token }: { rootSlotId: number; token: string | null }) {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, any[]>>({});

  const fetchChildren = async (slotId: number) => {
    try {
      const res = await apiPost("/api/member/genealogy/unilevel", { placement: slotId, root_slot: rootSlotId }, token);
      return res?._slot || res?.data || [];
    } catch { return []; }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const ch = await fetchChildren(rootSlotId);
      setChildren(ch);
      setLoading(false);
    })();
  }, [rootSlotId]);

  const toggleExpand = async (slotId: number) => {
    if (expanded[slotId]) {
      setExpanded(prev => { const n = { ...prev }; delete n[slotId]; return n; });
    } else {
      const ch = await fetchChildren(slotId);
      setExpanded(prev => ({ ...prev, [slotId]: ch }));
    }
  };

  const renderNode = (node: any, depth: number) => (
    <div key={node.slot_id} style={{ marginLeft: depth * 24 }} className="py-1">
      <button onClick={() => toggleExpand(node.slot_id)} className="flex items-center gap-2 hover:bg-muted/50 rounded px-2 py-1 w-full text-left">
        <Avatar className="h-8 w-8">
          {node.profile_picture ? <AvatarImage src={node.profile_picture} /> : null}
          <AvatarFallback className="bg-green-100 text-green-700 text-[10px]">{initials(`${node.first_name || ""} ${node.last_name || ""}`)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">{node.slot_no}</span>
            {node.settings?.show_full_name === 1 && <span className="text-xs text-muted-foreground">{node.first_name} {node.last_name}</span>}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {node.settings?.show_membership === 1 && node.membership_name && <span>{node.membership_name}</span>}
            {node.settings?.show_directs_no === 1 && <span>Direct: {node.total_recruits ?? 0}</span>}
            {node.settings?.show_sponsor_username === 1 && <span>Sponsor: {node.sponsor_username}</span>}
          </div>
        </div>
        <ChevronRight className={`h-3 w-3 transition-transform ${expanded[node.slot_id] ? "rotate-90" : ""}`} />
      </button>
      {expanded[node.slot_id]?.map((child: any) => renderNode(child, depth + 1))}
    </div>
  );

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (children.length === 0) return <p className="text-center text-muted-foreground py-10">No unilevel members found.</p>;

  return <Card><CardContent className="pt-4 max-h-[500px] overflow-y-auto">{children.map(c => renderNode(c, 0))}</CardContent></Card>;
}

/* ─── Downline table (for placement/sponsor/matrix lists) ─── */
function DownlineTable({ type, slotId, token }: { type: "placement" | "sponsor" | "matrix"; slotId: number; token: string | null }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const endpoints: Record<string, string> = { placement: "/api/member/genealogy/get_downline", sponsor: "/api/member/genealogy/get_sponsor", matrix: "/api/member/genealogy/get_matrix" };

  const fetchData = async (p = page) => {
    setLoading(true);
    try {
      const res = await apiPost(endpoints[type], { slot_id: slotId, search, page: p }, token);
      setData(res);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const items = data?.data || (Array.isArray(data) ? data : []);
  const lastPage = data?.last_page || 1;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 max-w-sm">
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchData(1)} />
        <Button variant="outline" size="sm" onClick={() => { setPage(1); fetchData(1); }}><Search className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No downline members found.</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Sponsor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m: any, i: number) => (
                <TableRow key={m.slot_id || i}>
                  <TableCell className="font-mono text-xs">{m.slot_no}</TableCell>
                  <TableCell className="text-sm">{m.first_name} {m.last_name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{m.membership_name || "-"}</Badge></TableCell>
                  <TableCell className="text-xs">{formatDate(m.slot_date_created)}</TableCell>
                  <TableCell className="text-xs">{m.sponsor_username || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-xs">{page} / {lastPage}</span>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

/* ─── Place Unplaced Slot Dialog ─── */
function PlaceSlotDialog({ open, onOpenChange, slotId, token, onPlaced }: { open: boolean; onOpenChange: (b: boolean) => void; slotId: number; token: string | null; onPlaced: () => void }) {
  const [unplacedSlots, setUnplacedSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [position, setPosition] = useState("LEFT");
  const [placement, setPlacement] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [onlyPosition, setOnlyPosition] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await apiPost("/api/check_unplaced_slot", { slot_id: slotId }, token);
        if (res?.status === "disabled_placement") {
          toast.error(res.message || "Placement disabled");
          onOpenChange(false);
          return;
        }
        if (res?.slots?.length) {
          setUnplacedSlots(res.slots);
          setSelectedSlot(res.slots[0].slot_no);
          if (res.position) { setPosition(res.position); setOnlyPosition(res.position); }
          else { setPosition("0"); setOnlyPosition(null); }
        } else {
          toast.error("No unplaced slots");
          onOpenChange(false);
        }
      } catch { toast.error("Failed to check unplaced slots"); onOpenChange(false); }
    })();
  }, [open]);

  const handlePreview = async () => {
    setSubmitting(true);
    try {
      const body = { slot_no: selectedSlot, placement, position, owner_id: slotId };
      const res = await apiPost("/api/slot_preview_place_own_downline", { data: body, type: "member_owned" }, token);
      if (res?.status) {
        (res.status_message || []).forEach((m: string) => toast.error(m));
      } else {
        setPreview(res);
      }
    } catch { toast.error("Preview failed"); }
    setSubmitting(false);
  };

  const handlePlace = async () => {
    setSubmitting(true);
    try {
      const body = { slot_no: selectedSlot, placement, position, owner_id: slotId, root_id: slotId };
      const res = await apiPost("/api/place_downline_slot_other_info", body, token);
      if (res?.status === "success") {
        toast.success(res.status_message || "Slot placed successfully");
        onPlaced();
        onOpenChange(false);
      } else {
        (res?.status_message || []).forEach((m: string) => toast.error(m));
      }
    } catch { toast.error("Placement failed"); }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{preview ? "Confirm Placement" : "Place Unplaced Slot"}</DialogTitle></DialogHeader>
        {preview ? (
          <div className="space-y-3">
            <div className="text-sm">
              <p><strong>Slot:</strong> {preview.slot_no}</p>
              <p><strong>Name:</strong> {preview.first_name} {preview.last_name}</p>
              <p><strong>Position:</strong> {position}</p>
              <p><strong>Placement Under:</strong> {placement || "Auto"}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreview(null)}>Back</Button>
              <Button onClick={handlePlace} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Confirm Place</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {unplacedSlots.length > 0 && (
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger><SelectValue placeholder="Select slot" /></SelectTrigger>
                <SelectContent>{unplacedSlots.map(s => <SelectItem key={s.slot_no} value={s.slot_no}>{s.slot_no} - {s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <Input placeholder="Placement under (slot no)" value={placement} onChange={e => setPlacement(e.target.value)} />
            <Select value={position} onValueChange={setPosition} disabled={!!onlyPosition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Auto</SelectItem>
                <SelectItem value="LEFT">Left</SelectItem>
                <SelectItem value="RIGHT">Right</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handlePreview} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Preview</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Genealogy Page ─── */
export default function MemberGenealogyPage() {
  const { token, currentSlot } = useAuthStore();
  const slotId = currentSlot?.slot_id;

  const [activeTab, setActiveTab] = useState("unilevel");
  const [planStatus, setPlanStatus] = useState<Record<string, number>>({});
  const [userInfo, setUserInfo] = useState<any>(null);
  const [placeDialogOpen, setPlaceDialogOpen] = useState(false);
  const [unplacedCount, setUnplacedCount] = useState(0);

  /* Load plan statuses to determine which tabs to show */
  useEffect(() => {
    if (!token) return;
    const plans = ["UNILEVEL", "BINARY", "UNILEVEL_MATRIX_BONUS", "BOARD", "DIRECT", "INDIRECT", "STAIRSTEP", "CASHBACK", "MONOLINE", "PASS_UP", "UNILEVEL_OR", "LEVELING_BONUS"];
    plans.forEach(plan => {
      apiPost("/api/member/get_earning", { plan }, token).then(res => {
        if (res?.status !== undefined) setPlanStatus(prev => ({ ...prev, [plan]: res.status }));
      }).catch(() => {});
    });
  }, [token]);

  /* Load user info */
  useEffect(() => {
    if (!token || !slotId) return;
    apiPost("/api/settings/get_user_add_ons_info", { id: slotId, board_level: 1 }, token).then(res => {
      if (res?.user_info) setUserInfo(res.user_info);
    }).catch(() => {});
  }, [token, slotId]);

  /* Check unplaced downline slots */
  useEffect(() => {
    if (!token || !slotId) return;
    apiPost("/api/check_unplaced_downline_slot", { slot_id: slotId }, token).then(res => {
      if (Array.isArray(res) && res.length > 0) setUnplacedCount(res.length);
    }).catch(() => {});
  }, [token, slotId]);

  /* Determine visible tabs */
  const showBinary = planStatus.BINARY === 1 || planStatus.LEVELING_BONUS === 1;
  const showUnilevel = true; // always show unilevel as default
  const showMatrix = planStatus.UNILEVEL_MATRIX_BONUS === 1;
  const showBoard = planStatus.BOARD === 1;

  /* Set default tab based on plan */
  useEffect(() => {
    if (showBinary && userInfo?.binary_placement_enable === 0) setActiveTab("binary");
    else if (showMatrix && currentSlot?.show_unilevel === 0) setActiveTab("matrix");
  }, [planStatus, userInfo, currentSlot]);

  const handleExport = () => {
    if (!slotId) return;
    const params = `slot_id=${slotId}&genealogy_type=${activeTab.toUpperCase()}`;
    window.open(`/api/member/genealogy/export?${params}`, "_blank");
  };

  if (!slotId) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Genealogy</h1>
        <div className="flex gap-2">
          {unplacedCount > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setPlaceDialogOpen(true)}>
              Place Slots ({unplacedCount})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export</Button>
        </div>
      </div>

      {/* User info card */}
      {userInfo && (
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <Avatar className="h-12 w-12">
              {userInfo.profile_picture ? <AvatarImage src={userInfo.profile_picture} /> : null}
              <AvatarFallback className="bg-green-100 text-green-700">{initials(`${userInfo.first_name || ""} ${userInfo.last_name || ""}`)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{userInfo.first_name} {userInfo.last_name}</p>
              <p className="text-sm text-muted-foreground">{currentSlot?.slot_no} · {userInfo.membership_name || "-"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          {showUnilevel && (
            <TabsTrigger value="unilevel"><List className="h-4 w-4 mr-1" /> Unilevel</TabsTrigger>
          )}
          {showBinary && (
            <TabsTrigger value="binary"><Network className="h-4 w-4 mr-1" /> Binary</TabsTrigger>
          )}
          {showMatrix && (
            <TabsTrigger value="matrix"><Grid3X3 className="h-4 w-4 mr-1" /> Matrix</TabsTrigger>
          )}
          {showBoard && (
            <TabsTrigger value="board"><LayoutGrid className="h-4 w-4 mr-1" /> Board</TabsTrigger>
          )}
          <TabsTrigger value="downline_placement">Placement List</TabsTrigger>
          <TabsTrigger value="downline_sponsor">Sponsor List</TabsTrigger>
          {showMatrix && <TabsTrigger value="downline_matrix">Matrix List</TabsTrigger>}
        </TabsList>

        {/* Unilevel */}
        <TabsContent value="unilevel" className="space-y-4">
          <UnilevelTree rootSlotId={slotId} token={token} />
        </TabsContent>

        {/* Binary */}
        <TabsContent value="binary" className="space-y-4">
          <TreeView type="placement" rootSlotId={slotId} token={token} />
        </TabsContent>

        {/* Matrix */}
        <TabsContent value="matrix" className="space-y-4">
          <TreeView type="matrix" rootSlotId={slotId} token={token} />
        </TabsContent>

        {/* Board */}
        <TabsContent value="board" className="space-y-4">
          <TreeView type="board" rootSlotId={slotId} token={token} />
        </TabsContent>

        {/* Placement Downline List */}
        <TabsContent value="downline_placement" className="space-y-4">
          <DownlineTable type="placement" slotId={slotId} token={token} />
        </TabsContent>

        {/* Sponsor Downline List */}
        <TabsContent value="downline_sponsor" className="space-y-4">
          <DownlineTable type="sponsor" slotId={slotId} token={token} />
        </TabsContent>

        {/* Matrix Downline List */}
        {showMatrix && (
          <TabsContent value="downline_matrix" className="space-y-4">
            <DownlineTable type="matrix" slotId={slotId} token={token} />
          </TabsContent>
        )}
      </Tabs>

      {/* Place Slot Dialog */}
      <PlaceSlotDialog
        open={placeDialogOpen}
        onOpenChange={setPlaceDialogOpen}
        slotId={slotId}
        token={token}
        onPlaced={() => {
          setUnplacedCount(c => Math.max(0, c - 1));
          // Refresh by re-rendering the active tree
          setActiveTab(prev => prev);
        }}
      />
    </div>
  );
}
