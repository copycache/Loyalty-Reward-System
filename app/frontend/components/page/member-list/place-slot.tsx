"use client";

import { Button } from "@/components/ui/button";
import {
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlaceSlotContentProps {
  onClose: () => void;
}

export function PlaceSlotContent({ onClose }: PlaceSlotContentProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Place Slot</SheetTitle>
      </SheetHeader>

      <div className="no-scrollbar overflow-y-auto px-4">
        <form>
          <div className="space-y-4">
            <div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter Owners Username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placement">Placement</Label>
                  <Input id="placement" placeholder="Placement" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEFT">LEFT</SelectItem>
                      <SelectItem value="RIGHT">RIGHT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </form>
        <SheetFooter className="mt-6">
          <Button onClick={onClose}>
            Place Slot
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
