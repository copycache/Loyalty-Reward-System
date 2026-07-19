"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MapPin, Edit, Star } from "lucide-react";

export default function AddressesPage() {
  const { token } = useAuthStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Location cascade: Island Group → Region → Province → City → Barangay
  const [islandGroups, setIslandGroups] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const [form, setForm] = useState({
    receiver_name: "",
    receiver_contact_number: "",
    receiver_email: "",
    additional_info: "",
    island_group: "",
    regCode: "",
    provCode: "",
    citymunCode: "",
    brgyCode: "",
    address_postal_code: "",
  });

  const fetchAddresses = async () => {
    try {
      const res = await apiPost("/api/settings/get_addresses", {}, token);
      if (res) {
        const data = Array.isArray(res) ? res : res.data ? (Array.isArray(res.data) ? res.data : []) : [];
        setAddresses(data);
      }
    } catch {
      console.error("Failed to load addresses");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchAddresses();
      // Load island groups
      apiPost("/api/settings/get_location", { location: "ISLAND_GROUP" }, token).then((res) => {
        const data = Array.isArray(res) ? res : res?.data || [];
        setIslandGroups(data);
      });
    }
  }, [token]);

  const resetForm = () => {
    setForm({
      receiver_name: "", receiver_contact_number: "", receiver_email: "",
      additional_info: "", island_group: "", regCode: "", provCode: "",
      citymunCode: "", brgyCode: "", address_postal_code: "",
    });
    setEditId(null);
    setRegions([]);
    setProvinces([]);
    setCities([]);
    setBarangays([]);
  };

  const openNew = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = async (addr: any) => {
    setEditId(addr.address_id);
    setForm({
      receiver_name: addr.receiver_name || "",
      receiver_contact_number: addr.receiver_contact_number || "",
      receiver_email: addr.receiver_email || "",
      additional_info: addr.additional_info || "",
      island_group: String(addr.island_group || ""),
      regCode: String(addr.regCode || ""),
      provCode: String(addr.provCode || ""),
      citymunCode: String(addr.citymunCode || ""),
      brgyCode: String(addr.brgyCode || ""),
      address_postal_code: addr.address_postal_code || "",
    });
    // Load cascading dropdowns for existing values
    if (addr.island_group) {
      const rRes = await apiPost("/api/settings/get_location", { location: "REGION_LIST", code: addr.island_group }, token);
      setRegions(Array.isArray(rRes) ? rRes : rRes?.data || []);
    }
    if (addr.regCode) {
      const pRes = await apiPost("/api/settings/get_location", { location: "PROVINCE", code: addr.regCode }, token);
      setProvinces(Array.isArray(pRes) ? pRes : pRes?.data || []);
    }
    if (addr.provCode) {
      const cRes = await apiPost("/api/settings/get_location", { location: "CITY", code: addr.provCode }, token);
      setCities(Array.isArray(cRes) ? cRes : cRes?.data || []);
    }
    if (addr.citymunCode) {
      const bRes = await apiPost("/api/settings/get_location", { location: "BRGY", code: addr.citymunCode }, token);
      setBarangays(Array.isArray(bRes) ? bRes : bRes?.data || []);
    }
    setIsOpen(true);
  };

  const handleIslandGroupChange = async (v: string) => {
    setForm(p => ({ ...p, island_group: v, regCode: "", provCode: "", citymunCode: "", brgyCode: "" }));
    setRegions([]); setProvinces([]); setCities([]); setBarangays([]);
    const r = await apiPost("/api/settings/get_location", { location: "REGION_LIST", code: parseInt(v) }, token);
    setRegions(Array.isArray(r) ? r : r?.data || []);
  };

  const handleRegionChange = async (v: string) => {
    setForm(p => ({ ...p, regCode: v, provCode: "", citymunCode: "", brgyCode: "" }));
    setProvinces([]); setCities([]); setBarangays([]);
    const r = await apiPost("/api/settings/get_location", { location: "PROVINCE", code: v }, token);
    setProvinces(Array.isArray(r) ? r : r?.data || []);
  };

  const handleProvinceChange = async (v: string) => {
    setForm(p => ({ ...p, provCode: v, citymunCode: "", brgyCode: "" }));
    setCities([]); setBarangays([]);
    const r = await apiPost("/api/settings/get_location", { location: "CITY", code: v }, token);
    setCities(Array.isArray(r) ? r : r?.data || []);
  };

  const handleCityChange = async (v: string) => {
    setForm(p => ({ ...p, citymunCode: v, brgyCode: "" }));
    setBarangays([]);
    const r = await apiPost("/api/settings/get_location", { location: "BRGY", code: v }, token);
    setBarangays(Array.isArray(r) ? r : r?.data || []);
  };

  const handleSave = async () => {
    if (!form.receiver_name) {
      toast.error("Receiver name is required.");
      return;
    }
    setSaving(true);
    try {
      const endpoint = editId
        ? "/api/settings/update_address"
        : "/api/settings/add_addresses";
      const payload = editId ? { ...form, address_id: editId } : form;
      await apiPost(endpoint, payload, token);
      toast.success(editId ? "Address updated!" : "Address added!");
      setIsOpen(false);
      resetForm();
      fetchAddresses();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save address.");
    }
    setSaving(false);
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm("Delete this address?")) return;
    try {
      await apiPost("/api/settings/update_address_status", { address_id: addressId, action: "delete" }, token);
      toast.success("Address deleted.");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await apiPost("/api/settings/update_address_status", { address_id: addressId, action: "default" }, token);
      toast.success("Default address set.");
      fetchAddresses();
    } catch {
      toast.error("Failed to set default.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-1" /> Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Address" : "Add Address"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Receiver Name *</Label>
                  <Input value={form.receiver_name} onChange={(e) => setForm(p => ({ ...p, receiver_name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Contact Number</Label>
                  <Input value={form.receiver_contact_number} onChange={(e) => setForm(p => ({ ...p, receiver_contact_number: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={form.receiver_email} onChange={(e) => setForm(p => ({ ...p, receiver_email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Street / Additional Info</Label>
                <Input value={form.additional_info} onChange={(e) => setForm(p => ({ ...p, additional_info: e.target.value }))} />
              </div>

              {/* Location Cascade */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Island Group</Label>
                  <Select value={form.island_group} onValueChange={handleIslandGroupChange}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {islandGroups.map((ig: any) => (
                        <SelectItem key={ig.id} value={String(ig.id)}>{ig.island_group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Region</Label>
                  <Select value={form.regCode} onValueChange={handleRegionChange} disabled={regions.length === 0}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {regions.map((r: any) => (
                        <SelectItem key={r.id || r.regCode} value={String(r.regCode)}>{r.regDesc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Province</Label>
                  <Select value={form.provCode} onValueChange={handleProvinceChange} disabled={provinces.length === 0}>
                    <SelectTrigger><SelectValue placeholder="Province" /></SelectTrigger>
                    <SelectContent>
                      {provinces.map((p: any) => (
                        <SelectItem key={p.id || p.provCode} value={String(p.provCode)}>{p.provDesc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>City</Label>
                  <Select value={form.citymunCode} onValueChange={handleCityChange} disabled={cities.length === 0}>
                    <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
                    <SelectContent>
                      {cities.map((c: any) => (
                        <SelectItem key={c.id || c.citymunCode} value={String(c.citymunCode)}>{c.citymunDesc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Barangay</Label>
                  <Select value={form.brgyCode} onValueChange={(v) => setForm(p => ({ ...p, brgyCode: v }))} disabled={barangays.length === 0}>
                    <SelectTrigger><SelectValue placeholder="Barangay" /></SelectTrigger>
                    <SelectContent>
                      {barangays.map((b: any) => (
                        <SelectItem key={b.id || b.brgyCode} value={String(b.brgyCode)}>{b.brgyDesc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1 max-w-32">
                <Label>ZIP Code</Label>
                <Input value={form.address_postal_code} onChange={(e) => setForm(p => ({ ...p, address_postal_code: e.target.value }))} />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editId ? "Update" : "Add"} Address
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
          No saved addresses yet.
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr: any) => (
            <Card key={addr.address_id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold">{addr.receiver_name}</p>
                  <p className="text-sm text-muted-foreground">{addr.receiver_contact_number}</p>
                  {addr.additional_info && <p className="text-sm mt-1">{addr.additional_info}</p>}
                  <p className="text-sm text-muted-foreground">
                    {addr.barangay_city || [addr.brgyDesc, addr.refcitymun].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {addr.region_province || [addr.refprovince, addr.refregion].filter(Boolean).join(", ")}
                    {addr.address_postal_code && ` - ${addr.address_postal_code}`}
                  </p>
                  {addr.is_default === 1 && (
                    <span className="text-xs text-green-600 font-semibold">Default</span>
                  )}
                </div>
                <div className="flex gap-1">
                  {addr.is_default !== 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleSetDefault(addr.address_id)} title="Set as default">
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEdit(addr)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(addr.address_id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
