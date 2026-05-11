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

interface CreateSlotContentProps {
  onClose: () => void;
}

export function CreateSlotContent({ onClose }: CreateSlotContentProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Create Slot</SheetTitle>
      </SheetHeader>

      <div className="no-scrollbar overflow-y-auto px-4">
        <form>
          <div className="space-y-4">
            <div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" placeholder="Enter Code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">Pin</Label>
                  <Input id="pin" placeholder="Enter Pin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slotOwner">Slot Owner</Label>
                  <Input
                    id="slotOwner"
                    placeholder="Enter Owner Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sponsor">Sponsor</Label>
                  <Input
                    id="sponsor"
                    placeholder="Enter Sponsor (Username)"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
        <SheetFooter className="mt-6">
          <Button onClick={onClose}>
            Create Slot
          </Button>
          <Button variant="outline" type="submit">
            Get Code
          </Button>
          <SheetClose asChild>
            <Button variant="destructive">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </div>
    </>
  );
}
