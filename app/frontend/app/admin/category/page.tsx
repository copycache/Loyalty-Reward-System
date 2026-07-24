"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  description?: string;
  products_count?: number;
  status: string;
  created_at: string;
}

interface CategoryResponse {
  data: Category[];
}

interface CategoryForm {
  name: string;
  description: string;
  status: string;
}

const EMPTY_FORM: CategoryForm = {
  name: "",
  description: "",
  status: "active",
};

export default function AdminCategoryPage() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await apiPost<CategoryResponse>("/api/admin/category/list", {}, token);
      setCategories(Array.isArray(res) ? res : res.data || []);
    } catch {
      toast.error("Failed to load categories");
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openAdd() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(item: Category) {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      status: item.status,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!token) return;
    if (!form.name) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);

    try {
      const body: Record<string, string> = {
        name: form.name,
        description: form.description,
        status: form.status,
      };
      if (editItem) body.id = String(editItem.id);

      const endpoint = editItem
        ? "/api/admin/category/update"
        : "/api/admin/category/create";

      await apiPost(endpoint, body, token);
      toast.success(editItem ? "Category updated" : "Category created");
      setDialogOpen(false);
      loadCategories();
    } catch {
      toast.error("Failed to save category");
    }

    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!token) return;

    try {
      await apiPost("/api/admin/category/delete", { id }, token);
      toast.success("Category deleted");
      loadCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6">Product Categories</h1>
          <p className="text-muted-foreground">{categories.length} categories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCategories}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {c.description || "—"}
                      </TableCell>
                      <TableCell>{c.products_count ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "active" ? "default" : "secondary"} className={c.status === "active" ? "bg-green-100 text-green-800" : ""}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              {editItem ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Health & Wellness"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
