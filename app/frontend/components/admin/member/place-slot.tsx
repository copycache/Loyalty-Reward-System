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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dot, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";

interface PlaceSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCode?: string;
  onPlaced: () => void;
}

export function PlaceSlotModal({ open, onOpenChange, initialCode, onPlaced }: PlaceSlotModalProps) {
  const { token } = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const [slotCode, setSlotCode] = useState("");
  const [placement, setPlacement] = useState("");
  const [position, setPosition] = useState("LEFT");

  const [search, setSearch] = useState("");
  const [unplacedList, setUnplacedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSlotCode(initialCode ?? "");
      setPlacement("");
      setPosition("LEFT");
      setSearch(initialCode ?? "");
      setUnplacedList([]);
    }
  }, [open, initialCode]);

  async function handlePlaceSlot() {
    if (!token) return;
    setLoading(true);
    try {
      await apiPost(
        "/api/member/place_slot",
        { slot_code: slotCode, slot_placement: placement, slot_position: position, user },
        token
      );
      toast.success("Slot placed successfully");
      onOpenChange(false);
      onPlaced();
    } catch (err: any) {
      if (err?.status_message) toast.error(err.status_message);
      else toast.error("Failed to place slot");
    }
    setLoading(false);
  }

  async function autoPosition() {
    if (!token) return;
    try {
      const res: any = await apiPost("/api/member/get_auto_position", { user: user?.id }, token);
      if (res) {
        setPlacement(res.slot_no || "");
        setPosition(res.position || "LEFT");
      }
    } catch {
      toast.error("Auto position failed");
    }
  }

  async function handleSearchChange(q: string) {
    setSearch(q);
    if (!token) return;
    try {
      const res = await apiPost<any[]>("/api/slot/get_unplaced", { name: q }, token);
      setUnplacedList(Array.isArray(res) ? res : []);
    } catch {
      setUnplacedList([]);
    }
  }

  function selectOwner(slotNo: string) {
    setSearch(slotNo);
    apiPost("/api/member/get_unplaced", { slot_code: slotNo }, token)
      .then((r: any) => setSlotCode(r ?? slotNo))
      .catch(() => {});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Dot className="h-4 w-4 inline mr-1" /> Place Slot
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1 relative">
            <Label className="text-xs">Username</Label>
            <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Enter Owner Username" />
            {unplacedList.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 max-h-[200px] overflow-y-auto">
                {unplacedList.map((item: any) => (
                  <button
                    key={item.slot_no}
                    type="button"
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                    onClick={() => {
                      selectOwner(item.slot_no);
                      setUnplacedList([]);
                    }}
                  >
                    {item.slot_no} ({item.first_name} {item.last_name})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Placement</Label>
            <Input value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="Placement" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Position</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEFT">Left</SelectItem>
                <SelectItem value="RIGHT">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="secondary" onClick={autoPosition}>
            <Rocket className="h-4 w-4 mr-1" /> Auto Position
          </Button>
          <Button onClick={handlePlaceSlot} disabled={loading}>
            {loading ? "Placing..." : "Place Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}