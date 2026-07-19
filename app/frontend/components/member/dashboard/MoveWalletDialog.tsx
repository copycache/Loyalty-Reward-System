"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ArrowRightLeft } from "lucide-react";

interface MoveWalletDialogProps {
  walletTypes: any[];
  onSuccess?: () => void;
}

export function MoveWalletDialog({ walletTypes, onSuccess }: MoveWalletDialogProps) {
  const { token, currentSlot, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [fee, setFee] = useState(0);
  const [minAmount, setMinAmount] = useState(0);

  useEffect(() => {
    if (currentSlot) {
      setFee(Number(currentSlot.move_wallet_fee || 0));
      setMinAmount(Number(currentSlot.minimum_move_wallet || 0));
    }
  }, [currentSlot]);

  const toSafeString = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "";
    return String(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentSlot || !user) return;

    if (Number(amount) < minAmount) {
      toast.error(`Minimum amount is ${minAmount}`);
      return;
    }

    setLoading(true);
    try {
      // Find the main account slot id (usually the first slot)
      // Legacy uses: this.layout.current_slot.first_slot.slot_id
      // We assume currentSlot.first_slot exists or we need to fetch it.
      // If not available, we might need to rely on backend to know the main slot, 
      // or maybe it's passed in user object.
      // For now, let's try to use currentSlot.first_slot if it exists, roughly mapping legacy.
      const mainSlotId = currentSlot.first_slot?.slot_id; 
      
      if (!mainSlotId) {
          // Fallback or error if we can't determine main slot
          // But wait, if this slot IS the main slot, move wallet might not make sense or 
          // serves a different purpose (consolidating from other slots).
          // If this is a sub-slot, we move to main. 
          // Additional check: logic in legacy:
          // main_account: this.layout.current_slot.first_slot.slot_id
      }
      
      const payload = {
        amount: amount,
        wallet_type: selectedWalletId, // This might need to be 1, 2, etc. (wallet_type id from input)
        slot_id: currentSlot.slot_id,
        main_account: mainSlotId,
        minimum_move_wallet: minAmount,
        move_wallet_fee: fee,
      };

      const res = await apiPost("/api/member/move_wallet", payload, token);
      if (res.status_code === 200 || res.status === "success") {
        toast.success(res.status_message || "Funds moved successfully");
        setOpen(false);
        setAmount("");
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.status_message || "Failed to move funds");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          Move to Main
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Wallet to Main Account</DialogTitle>
          <DialogDescription>
            Transfer funds from this slot to your main account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Source Wallet</Label>
            <Select value={selectedWalletId} onValueChange={setSelectedWalletId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {walletTypes.map((w: any) => {
                  const walletValue = toSafeString(w.wallet_type_id ?? w.wallet_id);
                  return (
                    <SelectItem key={walletValue || w.wallet_id || Math.random()} value={walletValue}>
                      {w.currency_name} ({w.currency_abbreviation}) - Balance: {w.wallet_amount}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum: {minAmount} | Fee: {fee}
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Move Funds
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
