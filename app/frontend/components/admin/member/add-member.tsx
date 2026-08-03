"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countryList: any[];
  onMemberAdded: (init: { search?: string; owner?: string }) => void;
}

export function AddMemberModal({ open, onOpenChange, countryList, onMemberAdded }: AddMemberModalProps) {
  const { token } = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const [sponsor, setSponsor] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [countryId, setCountryId] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSponsor("");
      setUsername("");
      setEmail("");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setContact("");
      setCountryId("");
      setPassword("");
    }
  }, [open]);

  async function handleSubmit() {
    if (!token) return;
    setLoading(true);
    try {
      const res: any = await apiPost(
        "/api/member/add_member",
        {
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName,
          email: email,
          contact: contact,
          username: username,
          password: password,
          slot_referral: sponsor,
          register_platform: "system",
          country_id: countryId || 1,
          slot_link: "referral",
          user,
        },
        token
      );
      toast.success("Member added successfully");
      onOpenChange(false);

      if (res?.status_data_name && res?.status_data_id) {
        onMemberAdded({ search: res.status_data_name, owner: String(res.status_data_id) });
      }
    } catch (err: any) {
      if (err?.errors) {
        Object.values(err.errors as Record<string, string[]>)
          .flat()
          .forEach((m) => toast.error(m));
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to add member");
      }
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <UserPlus className="h-4 w-4 inline mr-1" /> Add New Member
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Sponsor Username</Label>
            <Input value={sponsor} onChange={(e) => setSponsor(e.target.value)} placeholder="Sponsor Username" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Middle Name</Label>
            <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle Name" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Contact Number</Label>
            <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact Number" maxLength={11} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Country / Currency</Label>
            <Select value={countryId} onValueChange={setCountryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countryList.map((c: any) => (
                  <SelectItem key={c.country_id} value={String(c.country_id)}>
                    {c.country_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Password</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save New Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}