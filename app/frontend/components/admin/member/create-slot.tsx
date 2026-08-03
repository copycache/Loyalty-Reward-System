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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dot, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

interface CreateSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: { search?: string; owner?: string };
  onCreated: () => void;
  onSlotCreated: (slotCode: string) => void;
}

export function CreateSlotModal({ open, onOpenChange, initial, onCreated, onSlotCreated }: CreateSlotModalProps) {
  const { token } = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [slotOwner, setSlotOwner] = useState("");
  const [slotSponsor, setSlotSponsor] = useState("");

  const [search, setSearch] = useState("");
  const [memberList, setMemberList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCode("");
      setPin("");
      setSlotOwner(initial?.owner ?? "");
      setSlotSponsor("");
      setSearch(initial?.search ?? "");
      setMemberList([]);
    }
  }, [open, initial]);

  async function handleCreateSlot() {
    if (!token) return;
    setLoading(true);
    try {
      const res: any = await apiPost(
        "/api/member/add_slot",
        { code, pin, slot_owner: slotOwner, slot_sponsor: slotSponsor, from_admin: 1, user },
        token
      );
      toast.success("Slot created successfully");
      onOpenChange(false);
      onCreated();
      if (res?.status_data_id) onSlotCreated(String(res.status_data_id));
    } catch (err: any) {
      if (err?.status_message) toast.error(err.status_message);
      else toast.error("Failed to create slot");
    }
    setLoading(false);
  }

  async function getRandomCode() {
    if (!token) return;
    try {
      const res: any = await apiPost("/api/admin/get_random_code", { user_id: user?.id }, token);
      if (res) {
        setCode(res.code_activation || "");
        setPin(res.code_pin || "");
      }
    } catch {
      toast.error("Failed to get code");
    }
  }

  async function handleSearchChange(q: string) {
    setSearch(q);
    if (!token) return;
    try {
      const res = await apiPost<any[]>("/api/member/slot_info", { name: q }, token);
      setMemberList(Array.isArray(res) ? res : []);
    } catch {
      setMemberList([]);
    }
  }

  function selectOwner(name: string, id: number) {
    setSearch(name);
    apiPost("/api/member/select_users", { id }, token)
      .then((r: any) => setSlotOwner(r ?? id))
      .catch(() => {});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Dot className="h-4 w-4 inline mr-1" /> Create Slot
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter Code" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Pin</Label>
            <Input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter Pin" />
          </div>

          <div className="space-y-1 relative">
            <Label className="text-xs">Slot Owner</Label>
            <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Enter Owner Name" />
            {memberList.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 max-h-[200px] overflow-y-auto">
                {memberList.map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                    onClick={() => {
                      selectOwner(item.name, item.id);
                      setMemberList([]);
                    }}
                  >
                    {item.name} ({item.email})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Sponsor</Label>
            <Input value={slotSponsor} onChange={(e) => setSlotSponsor(e.target.value)} placeholder="Sponsor (Username)" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="secondary" onClick={getRandomCode}>
            <QrCode className="h-4 w-4 mr-1" /> Get Code
          </Button>
          <Button onClick={handleCreateSlot} disabled={loading}>
            {loading ? "Creating..." : "Create Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}