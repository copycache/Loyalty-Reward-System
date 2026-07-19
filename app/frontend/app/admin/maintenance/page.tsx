"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost, apiUpload } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  RefreshCw,
  Shield,
  Users,
  Settings,
  Upload,
  Image,
  Key,
  GitBranch,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminMaintenancePage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState("admins");

  // Admin accounts
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [editAdminOpen, setEditAdminOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [adminForm, setAdminForm] = useState({
    email: "", first_name: "", last_name: "", contact: "",
    position_id: "", password: "", password_confirmation: "",
  });

  // Positions
  const [positions, setPositions] = useState<any[]>([]);
  const [positionOpen, setPositionOpen] = useState(false);
  const [positionName, setPositionName] = useState("");
  const [positionModules, setPositionModules] = useState<any[]>([]);

  // Modules
  const [modules, setModules] = useState<any[]>([]);
  const [modulesOpen, setModulesOpen] = useState(false);

  // Other settings
  const [otherSettings, setOtherSettings] = useState<any[]>([]);
  const [otherOpen, setOtherOpen] = useState(false);

  // CMS
  const [cmsList, setCmsList] = useState<any[]>([]);
  const [cmsOpen, setCmsOpen] = useState(false);

  // Logo
  const [logoOpen, setLogoOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // GC Settings
  const [gcOpen, setGcOpen] = useState(false);
  const [gcSettings, setGcSettings] = useState<any>({});

  // Dragonpay
  const [dpOpen, setDpOpen] = useState(false);
  const [dpSettings, setDpSettings] = useState<any>({});

  // Genealogy
  const [genealogyOpen, setGenealogyOpen] = useState(false);
  const [genealogyData, setGenealogyData] = useState<any>({});

  // Import
  const [importOpen, setImportOpen] = useState(false);
  const [importType, setImportType] = useState("members");
  const importFileRef = useRef<HTMLInputElement>(null);

  // Load admins
  const loadAdmins = useCallback(async () => {
    if (!token) return;
    setAdminsLoading(true);
    try {
      const res = await apiPost<any>("/api/maintenance/get_admin", {}, token);
      setAdmins(Array.isArray(res) ? res : (res?.data || []));
    } catch { /* */ }
    setAdminsLoading(false);
  }, [token]);

  const loadPositions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/maintenance/get_position", {}, token);
      setPositions(Array.isArray(res) ? res : []);
    } catch { /* */ }
  }, [token]);

  useEffect(() => { loadAdmins(); loadPositions(); }, [loadAdmins, loadPositions]);

  const handleCreateAdmin = async () => {
    if (!token) return;
    try {
      await apiPost("/api/maintenance/create_admin", adminForm, token);
      toast.success("Admin created");
      setAddAdminOpen(false);
      setAdminForm({ email: "", first_name: "", last_name: "", contact: "", position_id: "", password: "", password_confirmation: "" });
      loadAdmins();
    } catch (err: any) {
      toast.error(err.message || "Failed to create admin");
    }
  };

  const openEditAdmin = async (admin: any) => {
    setSelectedAdmin(admin);
    setAdminForm({
      email: admin.email || "",
      first_name: admin.first_name || "",
      last_name: admin.last_name || "",
      contact: admin.contact || "",
      position_id: String(admin.position_id || ""),
      password: admin.show_password || "",
      password_confirmation: admin.show_password || "",
    });
    setEditAdminOpen(true);
  };

  const handleUpdateAdmin = async () => {
    if (!token || !selectedAdmin) return;
    try {
      const body: any = { ...adminForm, id: selectedAdmin.id, show_password: adminForm.password };
      await apiPost("/api/maintenance/update_admin", body, token);
      toast.success("Admin updated");
      setEditAdminOpen(false);
      loadAdmins();
    } catch (err: any) {
      toast.error(err.message || "Failed to update admin");
    }
  };

  // Modules
  const loadModules = async () => {
    try {
      const res = await apiPost<any>("/api/maintenance/get_module", {}, token);
      setModules(Array.isArray(res) ? res : (res?.modules || []));
      setModulesOpen(true);
    } catch { toast.error("Failed to load modules"); }
  };

  const updateModules = async () => {
    try {
      await apiPost("/api/maintenance/update_module", { data: modules }, token);
      toast.success("Modules updated");
      setModulesOpen(false);
    } catch { toast.error("Failed to update modules"); }
  };

  // Other settings
  const loadOtherSettings = async () => {
    try {
      const res = await apiPost<any>("/api/maintenance/get_other_settings", {}, token);
      setOtherSettings(Array.isArray(res) ? res : []);
      setOtherOpen(true);
    } catch { toast.error("Failed to load settings"); }
  };

  const updateOtherSettings = async () => {
    try {
      const settingsBody: Record<string, any> = {};
      otherSettings.forEach((s: any, i: number) => { settingsBody[String(i)] = s; });
      await apiPost("/api/maintenance/update_other_settings", settingsBody, token);
      toast.success("Settings updated");
      setOtherOpen(false);
    } catch { toast.error("Failed to update settings"); }
  };

  // CMS
  const loadCMS = async () => {
    try {
      const res = await apiPost<any>("/api/maintenance/get_cms_list", {}, token);
      setCmsList(Array.isArray(res) ? res : (res?.data || []));
      setCmsOpen(true);
    } catch { toast.error("Failed to load CMS"); }
  };

  // Logo
  const handleLogoUpload = async () => {
    if (!logoPreview) return;
    try {
      await apiPost("/api/maintenance/save_logo", { url: logoPreview }, token);
      toast.success("Logo saved");
      setLogoOpen(false);
    } catch { toast.error("Failed to save logo"); }
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // GC
  const loadGC = async () => {
    try {
      const res = await apiPost<any>("/api/maintenance/load_gc", {}, token);
      setGcSettings(res || {});
      setGcOpen(true);
    } catch { toast.error("Failed to load GC settings"); }
  };

  const updateGC = async () => {
    try {
      await apiPost("/api/maintenance/update_gc", gcSettings, token);
      toast.success("GC settings updated");
      setGcOpen(false);
    } catch { toast.error("Failed to update"); }
  };

  // Dragonpay
  const loadDragonpay = async () => {
    try {
      const res = await apiPost<any>("/api/maintenance/load_dragonpay_settings", {}, token);
      setDpSettings(res || {});
      setDpOpen(true);
    } catch { toast.error("Failed to load Dragonpay settings"); }
  };

  const updateDragonpay = async () => {
    try {
      await apiPost("/api/maintenance/update_dragonpay", dpSettings, token);
      toast.success("Dragonpay settings updated");
      setDpOpen(false);
    } catch { toast.error("Failed to update"); }
  };

  // Genealogy
  const loadGenealogy = async () => {
    try {
      const res = await apiPost<any>("/api/genealogy_data/get", {}, token);
      setGenealogyData(res || {});
      setGenealogyOpen(true);
    } catch { toast.error("Failed to load genealogy settings"); }
  };

  const updateGenealogy = async () => {
    try {
      await apiPost("/api/genealogy_data/save", genealogyData, token);
      toast.success("Genealogy settings updated");
      setGenealogyOpen(false);
    } catch { toast.error("Failed to update"); }
  };

  // Import
  const handleImport = async () => {
    const file = importFileRef.current?.files?.[0];
    if (!file || !token) return;
    const fd = new FormData();
    fd.append("file", file);
    let endpoint = "";
    switch (importType) {
      case "members": endpoint = "/api/maintenance/import_member"; break;
      case "custom_members": endpoint = "/api/maintenance/import_custom_member"; break;
      case "member_slots": endpoint = "/api/maintenance/import_member_slot"; break;
      case "placement": endpoint = "/api/maintenance/import_placement"; break;
      case "wallet": endpoint = "/api/maintenance/import_adjust_wallet"; break;
    }
    try {
      await apiUpload(endpoint, fd, token);
      toast.success("Import started");
      setImportOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    }
  };

  const adminFormFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input value={adminForm.first_name} onChange={(e) => setAdminForm(prev => ({ ...prev, first_name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input value={adminForm.last_name} onChange={(e) => setAdminForm(prev => ({ ...prev, last_name: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={adminForm.email} onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Contact</Label>
        <Input value={adminForm.contact} onChange={(e) => setAdminForm(prev => ({ ...prev, contact: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Position</Label>
        <Select value={adminForm.position_id} onValueChange={(v) => setAdminForm(prev => ({ ...prev, position_id: v }))}>
          <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
          <SelectContent>
            {positions.map((p: any) => (
              <SelectItem key={p.position_id} value={String(p.position_id)}>{p.position_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" value={adminForm.password} onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Confirm Password</Label>
          <Input type="password" value={adminForm.password_confirmation} onChange={(e) => setAdminForm(prev => ({ ...prev, password_confirmation: e.target.value }))} />
        </div>
      </div>
    </div>
  );

  const numericKeys = ["slot_transfer", "default_slot_limit", "max_retailer", "dealers_bonus"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
        <p className="text-muted-foreground">System maintenance and administration</p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={loadModules}>
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <p className="font-medium text-sm">Module Settings</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={loadOtherSettings}>
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <Shield className="h-8 w-8 text-green-600" />
            <p className="font-medium text-sm">Other Settings</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={loadCMS}>
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <Image className="h-8 w-8 text-purple-600" />
            <p className="font-medium text-sm">CMS Images</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setLogoOpen(true)}>
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <Image className="h-8 w-8 text-orange-600" />
            <p className="font-medium text-sm">Change Logo</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={loadGC}>
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <Key className="h-8 w-8 text-yellow-600" />
            <p className="font-medium text-sm">GC Maintenance</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={loadDragonpay}>
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <Key className="h-8 w-8 text-red-600" />
            <p className="font-medium text-sm">Dragonpay</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={loadGenealogy}>
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <GitBranch className="h-8 w-8 text-teal-600" />
            <p className="font-medium text-sm">Genealogy</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setImportOpen(true)}>
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-indigo-600" />
            <p className="font-medium text-sm">Import Data</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Accounts + Positions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="admins">Admin Accounts</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Admin Accounts</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadAdmins}><RefreshCw className="h-4 w-4" /></Button>
                <Button onClick={() => { setAdminForm({ email: "", first_name: "", last_name: "", contact: "", position_id: "", password: "", password_confirmation: "" }); setAddAdminOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin Name</TableHead>
                    <TableHead>Admin Email</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Date Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No admin accounts</TableCell>
                    </TableRow>
                  ) : admins.map((a: any) => (
                    <TableRow key={a.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEditAdmin(a)}>
                      <TableCell className="font-medium">{a.name || `${a.first_name || ""} ${a.last_name || ""}`.trim()}</TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell><Badge variant="outline">{a.position_name || "—"}</Badge></TableCell>
                      <TableCell>{a.created_at || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Positions</CardTitle>
              <Button onClick={() => { setPositionName(""); setPositionModules([]); setPositionOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Position
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((p: any) => (
                    <TableRow key={p.position_id}>
                      <TableCell className="font-medium">{p.position_name}</TableCell>
                    </TableRow>
                  ))}
                  {positions.length === 0 && (
                    <TableRow>
                      <TableCell className="text-center py-10 text-muted-foreground">No positions</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Admin Modal */}
      <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Admin Account</DialogTitle></DialogHeader>
          {adminFormFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdminOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAdmin}>Create Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Modal */}
      <Dialog open={editAdminOpen} onOpenChange={setEditAdminOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Admin Account</DialogTitle></DialogHeader>
          {adminFormFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAdminOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateAdmin}>Update Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Position Modal */}
      <Dialog open={positionOpen} onOpenChange={setPositionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Position</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Position Name</Label>
              <Input value={positionName} onChange={(e) => setPositionName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPositionOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                await apiPost("/api/maintenance/create_position", { action: "add", position_name: positionName, module_access: positionModules }, token);
                toast.success("Position created");
                setPositionOpen(false);
                loadPositions();
              } catch { toast.error("Failed to create position"); }
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modules Modal */}
      <Dialog open={modulesOpen} onOpenChange={setModulesOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Module Settings</DialogTitle></DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module Name</TableHead>
                <TableHead>Main Module</TableHead>
                <TableHead>Slot Module</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((m: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{m.module_name}</TableCell>
                  <TableCell>
                    <Checkbox checked={!!m.module_is_enable} onCheckedChange={(v) => {
                      const updated = [...modules];
                      updated[i] = { ...m, module_is_enable: v ? 1 : 0 };
                      setModules(updated);
                    }} />
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={!!m.slot_is_enable} onCheckedChange={(v) => {
                      const updated = [...modules];
                      updated[i] = { ...m, slot_is_enable: v ? 1 : 0 };
                      setModules(updated);
                    }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModulesOpen(false)}>Cancel</Button>
            <Button onClick={updateModules}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other Settings Modal */}
      <Dialog open={otherOpen} onOpenChange={setOtherOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Other Settings</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {otherSettings.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b pb-3">
                <Label className="text-sm capitalize">{String(s.key || "").replace(/_/g, " ")}</Label>
                {numericKeys.includes(s.key) ? (
                  <Input type="number" className="w-24" value={s.value || ""} onChange={(e) => {
                    const updated = [...otherSettings];
                    updated[i] = { ...s, value: e.target.value };
                    setOtherSettings(updated);
                  }} />
                ) : (
                  <Checkbox checked={Number(s.value) === 1} onCheckedChange={(v) => {
                    const updated = [...otherSettings];
                    updated[i] = { ...s, value: v ? 1 : 0 };
                    setOtherSettings(updated);
                  }} />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOtherOpen(false)}>Cancel</Button>
            <Button onClick={updateOtherSettings}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CMS Modal */}
      <Dialog open={cmsOpen} onOpenChange={setCmsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>CMS Images</DialogTitle></DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cmsList.map((c: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>
                    {c.image_path ? (
                      <img src={c.image_path} alt="" className="h-16 w-16 object-cover rounded" />
                    ) : "—"}
                  </TableCell>
                  <TableCell>{c.image_description || "—"}</TableCell>
                </TableRow>
              ))}
              {cmsList.length === 0 && (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No CMS images</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Logo Modal */}
      <Dialog open={logoOpen} onOpenChange={setLogoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Logo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {logoPreview && (
              <div className="flex justify-center">
                <img src={logoPreview} alt="Logo preview" className="h-24 object-contain" />
              </div>
            )}
            <Input ref={logoInputRef} type="file" accept=".jpg,.png,.jpeg" onChange={handleLogoFile} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoOpen(false)}>Cancel</Button>
            <Button onClick={handleLogoUpload} disabled={!logoPreview}>Save Logo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GC Settings Modal */}
      <Dialog open={gcOpen} onOpenChange={setGcOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>GC Maintenance</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Wallet Amount Required</Label>
              <Input type="number" value={gcSettings.wallet_amount_required || ""} onChange={(e) => setGcSettings((prev: any) => ({ ...prev, wallet_amount_required: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Wallet Amount Deducted</Label>
              <Input type="number" value={gcSettings.wallet_amount_deducted || ""} onChange={(e) => setGcSettings((prev: any) => ({ ...prev, wallet_amount_deducted: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>GC Amount Given</Label>
              <Input type="number" value={gcSettings.gc_amount_given || ""} onChange={(e) => setGcSettings((prev: any) => ({ ...prev, gc_amount_given: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Label>Status</Label>
              <Switch checked={gcSettings.status === 1 || gcSettings.status === "enabled"} onCheckedChange={(v) => setGcSettings((prev: any) => ({ ...prev, status: v ? 1 : 0 }))} />
              <span className="text-sm">{gcSettings.status === 1 || gcSettings.status === "enabled" ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGcOpen(false)}>Cancel</Button>
            <Button onClick={updateGC}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dragonpay Modal */}
      <Dialog open={dpOpen} onOpenChange={setDpOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dragonpay Settings</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Merchant ID</Label>
              <Input value={dpSettings.merchant_id || ""} onChange={(e) => setDpSettings((prev: any) => ({ ...prev, merchant_id: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Merchant Password</Label>
              <Input type="password" value={dpSettings.merchant_password || ""} onChange={(e) => setDpSettings((prev: any) => ({ ...prev, merchant_password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={dpSettings.mode || "test"} onValueChange={(v) => setDpSettings((prev: any) => ({ ...prev, mode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Convenience Fee</Label>
              <Input type="number" value={dpSettings.convenience_fee || ""} onChange={(e) => setDpSettings((prev: any) => ({ ...prev, convenience_fee: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDpOpen(false)}>Cancel</Button>
            <Button onClick={updateDragonpay}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Genealogy Modal */}
      <Dialog open={genealogyOpen} onOpenChange={setGenealogyOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Genealogy Settings</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { key: "show_full_name", label: "Show Full Name" },
              { key: "show_username", label: "Show Username" },
              { key: "show_membership", label: "Show Membership" },
              { key: "show_date_joined", label: "Show Date Joined" },
              { key: "show_no_of_directs", label: "Show No. of Directs" },
              { key: "show_binary_points", label: "Show Binary Points" },
              { key: "show_maintenance_pv", label: "Show Maintenance PV" },
              { key: "show_sponsor_username", label: "Show Sponsor Username" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <Checkbox
                  checked={!!genealogyData[key]}
                  onCheckedChange={(v) => setGenealogyData((prev: any) => ({ ...prev, [key]: v ? 1 : 0 }))}
                />
                <Label className="text-sm">{label}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenealogyOpen(false)}>Cancel</Button>
            <Button onClick={updateGenealogy}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Import Data</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Import Type</Label>
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="members">Import Members</SelectItem>
                  <SelectItem value="custom_members">Import Custom Members</SelectItem>
                  <SelectItem value="member_slots">Import Members with Slots</SelectItem>
                  <SelectItem value="placement">Place Member</SelectItem>
                  <SelectItem value="wallet">Import Wallet Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Excel File (.xls, .xlsx)</Label>
              <Input ref={importFileRef} type="file" accept=".xls,.xlsx" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
