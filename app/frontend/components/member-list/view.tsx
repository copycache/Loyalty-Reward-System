"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogContent,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InformationContent } from "./view/information";

interface ViewContentProps {
  selectedUser: any;
  frameworks: string[];
}

export function ViewContent({ selectedUser, frameworks }: ViewContentProps) {
  return (
    <DialogContent className="sm:max-w-4xl max-h-sm overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Slot Information</DialogTitle>
      </DialogHeader>

      {selectedUser && (
        <Tabs defaultValue="overview" className="w-full h-full">
          <TabsList variant="line" className="grid grid-cols-4">
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="earningHistory">Earning History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="information">
            <InformationContent frameworks={frameworks} selectedUser={selectedUser} />
          </TabsContent>

          <TabsContent value="details">
            <form>
              <div className="text-center py-5">
                <DialogTitle>Slot Details</DialogTitle>
              </div>

              <div className="text-center py-5">
                <DialogTitle>Member Details</DialogTitle>
              </div>

              <div className="text-center py-5">
                <DialogTitle>Member's Valid ID</DialogTitle>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="earningHistory">
            <Card>
              <CardHeader>
                <CardTitle>Earning History</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                (Add Earning History here)
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                (Add settings form here)
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button>Update Slot Information</Button>
      </DialogFooter>
    </DialogContent>
  );
}
