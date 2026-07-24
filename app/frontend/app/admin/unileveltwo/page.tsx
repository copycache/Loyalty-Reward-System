"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Layers, RefreshCw, Save, Settings } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminUnilevelTwoPage() {
  const { token } = useAuthStore();
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiPost<any>("/api/admin/unileveltwo/list", {}, token);
      setLevels(Array.isArray(res) ? res : res?.data || res?.levels || []);
    } catch {
      toast.error("Failed to load unilevel plan 2 levels");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const openEdit = (data: any[]) => {
    setEditData(data);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiPost("/api/admin/unileveltwo/list", { levels: editData }, token);
      toast.success("Levels saved");
      setEditOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unilevel Plan 2</h1>
          <p className="text-muted-foreground">Second unilevel MLM plan configuration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => openEdit(levels)}>
            <Settings className="h-4 w-4 mr-2" />
            Edit Rates
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Unilevel Plan 2 Commission Levels
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels.length > 0 ? levels.map((level: any, i: number) => (
                  <TableRow key={level.id || i}>
                    <TableCell className="font-medium">Level {level.level || i + 1}</TableCell>
                    <TableCell>{level.commission || level.rate || level.percentage || "—"}%</TableCell>
                    <TableCell className="text-muted-foreground">{level.description || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={level.status === 1 || level.status === "active" ? "default" : "secondary"}>
                        {level.status === 1 || level.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      No unilevel plan 2 levels configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Edit Commission Rates
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editData.map((level: any, i: number) => (
              <div key={i} className="flex items-center gap-4 border-b pb-3">
                <Label className="w-20">Level {level.level || i + 1}</Label>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    value={level.commission ?? level.rate ?? level.percentage ?? ""}
                    onChange={(e) => {
                      const updated = [...editData];
                      updated[i] = { ...updated[i], commission: e.target.value };
                      setEditData(updated);
                    }}
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
