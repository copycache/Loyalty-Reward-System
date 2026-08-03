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
import { Checkbox } from "@/components/ui/checkbox";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

interface SlotLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SlotLimitModal({ open, onOpenChange }: SlotLimitModalProps) {
  const { token } = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const [allMembers, setAllMembers] = useState(false);
  const [slotLimit, setSlotLimit] = useState("");

  const [search, setSearch] = useState("");
  const [memberList, setMemberList] = useState<any[]>([]);
  const [limitData, setLimitData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAllMembers(false);
      setSlotLimit("");
      setSearch("");
      setMemberList([]);
      loadSlotLimit(0);
    }
  }, [open]);

  async function loadSlotLimit(id: number) {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/member/slot_limit", { id }, token);
      setLimitData(res);
    } catch {
    }
  }

  async function handleSearchChange(q: string) {
    setSearch(q);
    if (!token) return;
    try {
      const res = await apiPost<any[]>("/api/member/slot_info", { name: q }, token);
      setMemberList(Array.isArray(res) ? res : []);

      if (q.length === 0) {
        loadSlotLimit(0);
      } else if (res?.[0]?.id) {
        loadSlotLimit(res[0].id);
      }
    } catch {
      setMemberList([]);
    }
  }

  function selectOwner(name: string, id: number) {
    setSearch(name);
    if (id === 0) return;

    apiPost("/api/member/select_users", { id }, token)
      .then((r: any) => loadSlotLimit(r ?? id))
      .catch(() => {});
  }

  async function handleSubmit() {
    if (!token) return;
    setLoading(true);
    try {
      await apiPost(
        "/api/member/update_slot_limit",
        {
          ...limitData,
          update_all: allMembers ? 1 : 0,
          user,
          slot_limit: slotLimit,
        },
        token
      );
      toast.success("Slot limit updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update slot limit");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Ban className="h-4 w-4 inline mr-1" /> Slots Limit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Update All Slot</Label>
            <div className="flex items-center gap-2">
              <Checkbox checked={allMembers} onCheckedChange={(v) => setAllMembers(v === true)} id="updateAll" />
              <Label htmlFor="updateAll" className="text-sm cursor-pointer">
                Update All Slot
              </Label>
            </div>
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
            <Label className="text-xs">Slot Limit</Label>
            <Input
              type="number"
              value={slotLimit}
              onChange={(e) => setSlotLimit(e.target.value)}
              placeholder="Slot Limit"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}