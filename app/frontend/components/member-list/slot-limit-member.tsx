"use client";

import { Button } from "@/components/ui/button";
import {
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SlotLimitMemberContentProps {
  onClose: () => void;
}

export function SlotLimitMemberContent({ onClose }: SlotLimitMemberContentProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Slot Limit/Member</SheetTitle>
      </SheetHeader>

      <div className="no-scrollbar overflow-y-auto px-4">
        <form>
          <div className="space-y-4">
            <div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Update All Slot</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slotOwner">Slot Owner</Label>
                  <Input
                    id="slotOwner"
                    placeholder="Enter Owner Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slotLimit">Slot Limit</Label>
                  <Input id="slotLimit" type="number" />
                </div>
              </div>
            </div>
          </div>
        </form>
        <SheetFooter className="mt-6">
          <Button onClick={onClose}>
            Submit
          </Button>
          <Button variant="outline" type="submit">
            Auto Position
          </Button>
          <SheetClose asChild>
            <Button variant="destructive">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </div>
    </>
  );
}
