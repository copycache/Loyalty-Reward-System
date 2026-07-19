"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost, apiUpload } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ProfilePage() {
  const { user, loadUser, token, currentSlot } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [form, setForm] = useState({
    team_name: "",
    gender: "",
    birth_month: "",
    birth_day: "",
    birth_year: "",
    store_name: "",
  });

  // Load profile data from backend
  useEffect(() => {
    if (!token || !currentSlot?.slot_id) return;
    apiPost("/api/settings/get_user_info", { slot_id: currentSlot.slot_id }, token)
      .then((res) => {
        if (res) {
          setProfileData(res);
          setForm({
            team_name: res.team_name || "",
            gender: res.gender || "",
            birth_month: res.birth_month || "",
            birth_day: res.birth_day || "",
            birth_year: res.birth_year || "",
            store_name: res.store_name || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInfo(false));
  }, [token, currentSlot?.slot_id]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiPost("/api/settings/update_user_info", {
        ...form,
        slot_id: currentSlot?.slot_id,
      }, token);
      await loadUser();
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiUpload("/api/settings/upload_profile", formData, token);
      await loadUser();
      toast.success("Photo updated!");
    } catch {
      toast.error("Failed to upload photo.");
    }
  };

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "??";

  if (loadingInfo) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData?.profile_picture || user?.photo_url} />
                <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-green-600 rounded-full p-1.5 cursor-pointer hover:bg-green-700">
                <Camera className="h-3 w-3 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <div>
              <p className="font-semibold">{profileData?.name || `${user?.first_name} ${user?.last_name}`}</p>
              <p className="text-sm text-muted-foreground">{profileData?.user_email || user?.email}</p>
              {profileData?.achievers_rank && profileData.achievers_rank !== "---" && (
                <p className="text-xs text-green-600">Rank: {profileData.achievers_rank}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={user?.first_name || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={user?.last_name || ""} disabled className="bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Team Name</Label>
            <Input value={form.team_name} onChange={(e) => updateField("team_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Store Name</Label>
            <Input value={form.store_name} onChange={(e) => updateField("store_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => updateField("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Birthdate</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={form.birth_month} onValueChange={(v) => updateField("birth_month", v)}>
                <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Day" type="number" min="1" max="31" value={form.birth_day} onChange={(e) => updateField("birth_day", e.target.value)} />
              <Input placeholder="Year" type="number" min="1900" max="2010" value={form.birth_year} onChange={(e) => updateField("birth_year", e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
