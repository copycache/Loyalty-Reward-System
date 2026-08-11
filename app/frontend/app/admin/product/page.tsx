"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Package,
  BarChart3,
  Columns3,
  Save,
  QrCode,
  FileSpreadsheet,
  FileText,
  X,
  Trash2,
  Undo2,
  Ban,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

const PAGE_SIZE = 15;

export default function AdminProductsPage() {
  const { token } = useAuthStore();
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [submitted, setSubmitted] = useState(false);
  const searchRef = useRef(search);
  searchRef.current = search;

  // Column visibility (localStorage)
  const [column, setColumn] = useState<any>({
    product_sku: true,
    product_description: true,
    product_type: true,
    product_price: true,
    product_gc_price: true,
  });
  const [columnOpen, setColumnOpen] = useState(false);

  // Product edit modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [action, setAction] = useState<"add" | "edit">("add");
  const [item, setItem] = useState<any>({
    item_thumbnail: "",
    item_sku: "",
    item_description: "",
    item_inclusion_details: "",
    item_barcode: "",
    item_price: "",
    item_charged: "",
    qty_charged: "",
    item_gc_price: 0,
    item_pv: 0,
    item_binary_pts: 0,
    item_type: "product",
    bind_membership_id: 0,
    item_category: "",
    item_sub_category: "",
    code_user: "buyer",
    upgrade: "0",
    availability: "all",
    archived: 0,
    is_kit_upgrade: "0",
    tag_as: "none",
    item_id: null,
    item_kit: [{ item_inclusive_id: "", item_qty: "" }],
    item_membership_discount: [],
    item_dropshipping_bonus: [],
    slot_qty: "",
    membership_id: "",
  });
  const [detailTab, setDetailTab] = useState("modify");
  const [membershipList, setMembershipList] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [planStatus, setPlanStatus] = useState<any>({});
  const [stockistList, setStockistList] = useState<any[]>([]);
  const [highestMembership, setHighestMembership] = useState<any[]>([]);
  const [rowClicked, setRowClicked] = useState<number | null>(null);

  // Code section state
  const [itemCodeSubmit, setItemCodeSubmit] = useState<any>({
    status: "all",
    search: null,
    page: 1,
  });
  const [itemCode, setItemCode] = useState<any>(null);
  const [codeLoading, setCodeLoading] = useState(false);

  // Generate codes modal
  const [genCodeOpen, setGenCodeOpen] = useState(false);
  const [relKitItem, setRelKitItem] = useState<any>(null);
  const [generateCodes, setGenerateCodes] = useState<any>({
    number_of_codes: 0,
  });
  const [generateSubmit, setGenerateSubmit] = useState(false);

  // Stocks report modal
  const [stocksOpen, setStocksOpen] = useState(false);
  const [stocksData, setStocksData] = useState<any[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [inventoryFilter, setInventoryFilter] = useState<any>({
    type: "all",
    search: null,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_product_column");
      if (saved) setColumn(JSON.parse(saved));
    }
  }, []);

  const loadProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const body: any = {
        page,
        search_key: searchRef.current,
        per_page: PAGE_SIZE,
        item_type: typeFilter === "all" ? null : typeFilter,
      };
      if (categoryFilter !== "all") body.item_category = categoryFilter;
      if (subCategoryFilter !== "all")
        body.item_sub_category = subCategoryFilter;
      const res = await apiPost<any>("/api/product/get", body, token);
      if (res?.data) {
        setProducts(res.data);
        setTotalPages(res.last_page || 1);
        setTotal(res.total || res.data.length);
      } else if (Array.isArray(res)) {
        setProducts(res);
        setTotalPages(1);
        setTotal(res.length);
      } else setProducts([]);
    } catch {
      toast.error("Failed to load products");
    }
    setLoading(false);
  }, [token, page, typeFilter, categoryFilter, subCategoryFilter]);

  const loadCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>(
        "/api/product/get_category_list",
        {},
        token,
      );
      if (Array.isArray(res)) setCategories(res);
    } catch {}
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);
  useEffect(() => {
    loadCategories();
  }, []);
  useEffect(() => {
    if (!token) return;
    apiPost<any>("/api/membership/get", {}, token)
      .then((r) => {
        if (Array.isArray(r)) setMembershipList(r);
      })
      .catch(() => {});
    apiPost<any>("/api/get_product", {}, token)
      .then((r) => {
        if (Array.isArray(r)) setProductList(r);
      })
      .catch(() => {});
    apiPost<any>("/api/plan/get", { plan: "DROPSHIPPING_BONUS" }, token)
      .then((r) => {
        setPlanStatus({ DROPSHIPPING_BONUS: r });
      })
      .catch(() => {});
    apiPost<any>(
      "/api/product/highest_membership_list",
      { category_id: "" },
      token,
    )
      .then((r) => {
        if (Array.isArray(r)) setHighestMembership(r);
      })
      .catch(() => {});
  }, [token]);

  function getSubcategoryList(categoryId: string) {
    if (!token) return;
    apiPost<any>(
      "/api/product/get_subcategory_list",
      { category_id: categoryId },
      token,
    )
      .then((r) => {
        if (Array.isArray(r)) setSubCategories(r);
      })
      .catch(() => {});
  }

  function addProduct() {
    setAction("add");
    setDetailTab("modify");
    setItem({
      item_thumbnail: "",
      item_sku: "",
      item_description: "",
      item_inclusion_details: "",
      item_barcode: "",
      item_price: "",
      item_charged: "",
      qty_charged: "",
      item_gc_price: 0,
      item_pv: 0,
      item_binary_pts: 0,
      item_type: "product",
      bind_membership_id: 0,
      item_category: "",
      item_sub_category: "",
      code_user: "buyer",
      upgrade: "0",
      availability: "all",
      archived: 0,
      is_kit_upgrade: "0",
      tag_as: "none",
      item_id: null,
      item_kit: [{ item_inclusive_id: "", item_qty: "" }],
      item_membership_discount: membershipList.map((m: any) => ({
        membership_id: m.membership_id,
        membership_name: m.membership_name,
        discount: 0,
      })),
      item_dropshipping_bonus: membershipList.map((m: any) => ({
        membership_id: m.membership_id,
        membership_name: m.membership_name,
        commission: 0,
        type: "fixed",
      })),
      slot_qty: "",
      membership_id: membershipList[0]?.membership_id || "",
    });
    setDetailOpen(true);
  }

  async function editProduct(id: number) {
    if (!token) return;
    setAction("edit");
    setDetailTab("modify");
    setRowClicked(null);
    setItemCode(null);
    try {
      const data = await apiPost<any>("/api/product/data", { id }, token);
      setItem({
        item_id: data.item_id,
        item_sku: data.item_sku,
        item_thumbnail: data.item_thumbnail,
        item_description: data.item_description,
        item_inclusion_details: data.item_inclusion_details,
        item_barcode: data.item_barcode,
        item_price: data.item_price,
        item_charged: data.item_charged,
        qty_charged: data.qty_charged,
        item_gc_price: data.item_gc_price,
        item_pv: data.item_pv,
        item_binary_pts: data.item_binary_pts,
        item_type: data.item_type,
        bind_membership_id: data.bind_membership_id,
        item_category: String(data.item_category),
        item_sub_category: String(data.item_sub_category || ""),
        code_user: data.code_user || "buyer",
        upgrade: String(data.upgrade_own ?? "0"),
        availability: data.item_availability || "all",
        archived: data.archived,
        is_kit_upgrade: String(data.is_kit_upgrade ?? "0"),
        tag_as: data.tag_as || "none",
        slot_qty: data.slot_qty,
        membership_id: data.membership_id,
        inclusive_gc: data.inclusive_gc,
        item_kit: data.item_kit?.length
          ? data.item_kit.map((k: any) => ({
              item_inclusive_id: k.item_inclusive_id,
              item_qty: k.item_qty,
            }))
          : [{ item_inclusive_id: "", item_qty: "" }],
        item_membership_discount: membershipList.map((m: any) => {
          const found = data.membership_discount?.find(
            (d: any) => d.membership_id == m.membership_id,
          );
          return {
            membership_id: m.membership_id,
            membership_name: m.membership_name,
            discount: found?.discount ?? 0,
          };
        }),
        item_dropshipping_bonus: membershipList.map((m: any) => {
          const found = data.item_dropshipping_bonus?.find(
            (d: any) => d.membership_id == m.membership_id,
          );
          return {
            membership_id: m.membership_id,
            membership_name: m.membership_name,
            commission: found?.commission ?? 0,
            type: found?.type ?? "fixed",
          };
        }),
      });
      setStockistList(data.stockist_list || []);
      setItemCodeSubmit({
        status: "all",
        search: null,
        page: 1,
        item_id: data.item_id,
        branch_name: "",
        branch_id: null,
        inventory_id: null,
      });
      getSubcategoryList(data.item_category);
      loadItemInventory(data.item_id);
      setDetailOpen(true);
    } catch {
      toast.error("Failed to load product");
    }
  }

  async function loadItemInventory(id: number) {
    if (!token) return;
    try {
      const res = await apiPost<any>(
        "/api/product/get_item_inventory",
        { id },
        token,
      );
      setBranchList(Array.isArray(res) ? res : []);
    } catch {
      setBranchList([]);
    }
  }

  function changeItemBranch(
    itemId: number,
    inventoryId: number,
    branchName: string,
    branchId: number,
    index: number,
  ) {
    setRowClicked(index);
    setItemCodeSubmit((f: any) => ({
      ...f,
      item_id: itemId,
      inventory_id: inventoryId,
      branch_name: branchName,
      branch_id: branchId,
      page: 1,
      status: "all",
      search: null,
    }));
    loadItemCode({
      ...itemCodeSubmit,
      item_id: itemId,
      inventory_id: inventoryId,
      branch_name: branchName,
      branch_id: branchId,
      page: 1,
      status: "all",
      search: null,
    });
  }

  async function loadItemCode(filter: any) {
    if (!token) return;
    setCodeLoading(true);
    try {
      const res = await apiPost<any>(
        "/api/product/get_item_code",
        filter,
        token,
      );
      setItemCode(res);
    } catch {}
    setCodeLoading(false);
  }

  function itemCodeGoToPage(p: number) {
    setItemCodeSubmit((f: any) => ({ ...f, page: p }));
    loadItemCode({ ...itemCodeSubmit, page: p });
  }

  async function generateCodeV2(itemId: number) {
    if (!token) return;
    try {
      const res = await apiPost<any>(
        "/api/product/generate_codes",
        { item_id: itemId, branch_id: itemCodeSubmit.branch_id },
        token,
      );
      setRelKitItem(res);
      setGenerateCodes({ number_of_codes: 0 });
      setGenCodeOpen(true);
    } catch {
      toast.error("Failed to generate codes");
    }
  }

  async function generateCodeSubmit() {
    if (!token) return;
    if (
      generateCodes.number_of_codes <= 0 ||
      generateCodes.number_of_codes > (relKitItem?.max_code || 0)
    ) {
      toast.error("Invalid number of codes");
      return;
    }
    if (!itemCodeSubmit.branch_id) {
      toast.error("Please select branch first");
      return;
    }
    setGenerateSubmit(true);
    try {
      await apiPost(
        "/api/branch/cashier/generate_codes",
        {
          branch_id: itemCodeSubmit.branch_id,
          item_id: item.item_id,
          quantity: generateCodes.number_of_codes,
          user,
        },
        token,
      );
      toast.success("Codes generated");
      setGenCodeOpen(false);
      loadItemCode(itemCodeSubmit);
      loadItemInventory(item.item_id);
    } catch {
      toast.error("Failed to generate codes");
    }
    setGenerateSubmit(false);
  }

  async function deleteCode(codeId: number, archived: number) {
    if (!token) return;
    try {
      await apiPost(
        "/api/branch/cashier/delete_code",
        { code_id: codeId, archived, user },
        token,
      );
      toast.success("Code updated");
      loadItemCode(itemCodeSubmit);
      loadItemInventory(item.item_id);
    } catch {
      toast.error("Failed to update code");
    }
  }

  async function handleSubmit() {
    if (!token) return;
    setSubmitted(true);
    try {
      const body: any = { user };
      if (item.item_type === "membership_kit") item.tag_as = "none";
      const kitFix: any = {};
      item.item_kit.forEach((k: any, i: number) => {
        kitFix[i] = {
          item_inclusive_id: k.item_inclusive_id,
          item_qty: k.item_qty,
        };
      });
      const discFix: any = {};
      item.item_membership_discount.forEach((d: any, i: number) => {
        discFix[i] = {
          membership_id: d.membership_id,
          membership_name: d.membership_name,
          discount: d.discount,
        };
      });
      const dropFix: any = {};
      item.item_dropshipping_bonus.forEach((d: any, i: number) => {
        dropFix[i] = {
          membership_id: d.membership_id,
          membership_name: d.membership_name,
          commission: d.commission,
          type: d.type,
        };
      });
      body.item = {
        ...item,
        item_kit_fix: kitFix,
        item_membership_discount_fix: discFix,
        item_dropshipping_bonus_fix: dropFix,
      };
      if (action === "add") {
        const res = await apiPost<any>("/api/product/add", body, token);
        toast.success(res.status_message || "Product added");
        setItem((prev: any) => ({ ...prev, item_id: res.id }));
        setAction("edit");
      } else {
        body.stockist = stockistList;
        const res = await apiPost<any>("/api/product/edit", body, token);
        toast.success(res.status_message || "Product updated");
      }
      loadProducts();
    } catch (err: any) {
      if (err?.status_message) toast.error(err.status_message);
      else toast.error("Failed to save product");
    }
    setSubmitted(false);
  }

  async function handleArchive(productId: number, isArchived: boolean) {
    if (!token) return;
    if (!confirm("Are you sure?")) return;
    try {
      const endpoint = isArchived
        ? "/api/product/unarchive"
        : "/api/product/archive";
      await apiPost(endpoint, { id: productId, user }, token);
      toast.success(isArchived ? "Product restored" : "Product archived");
      loadProducts();
      setDetailOpen(false);
    } catch {
      toast.error("Failed to update product");
    }
  }

  function addItemKit(index: number) {
    setItem((prev: any) => {
      const kit = [...prev.item_kit];
      kit[index + 1] = { item_inclusive_id: "", item_qty: "" };
      return { ...prev, item_kit: kit };
    });
  }

  function deleteItemKit(index: number) {
    setItem((prev: any) => {
      const kit = prev.item_kit.filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        item_kit: kit.length ? kit : [{ item_inclusive_id: "", item_qty: "" }],
      };
    });
  }

  async function recountInventory() {
    if (!token) return;
    try {
      await apiPost("/api/product/recount_inventory", {}, token);
    } catch {}
  }

  async function handleCheckStocks() {
    if (!token) return;
    setStocksOpen(true);
    setStocksLoading(true);
    await recountInventory();
    try {
      const res = await apiPost<any>(
        "/api/product/check_stocks",
        inventoryFilter,
        token,
      );
      setStocksData(Array.isArray(res) ? res : []);
    } catch {
      setStocksData([]);
    }
    setStocksLoading(false);
  }

  function columnSave() {
    localStorage.setItem("admin_product_column", JSON.stringify(column));
    toast.success("Column Updated");
    setColumnOpen(false);
  }

  const hasDropshipping = planStatus?.DROPSHIPPING_BONUS?.status === 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product List</h1>
          <p className="text-muted-foreground">
            Manage Products & Membership information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCheckStocks}>
            <BarChart3 className="h-4 w-4 mr-1" /> Current Stocks
          </Button>
          <Button variant="outline" onClick={() => setColumnOpen(true)}>
            <Columns3 className="h-4 w-4 mr-1" /> Manage Columns
          </Button>
          <Button onClick={addProduct}>
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => {
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Type</SelectItem>
                <SelectItem value="product">Products/items Only</SelectItem>
                <SelectItem value="membership_kit">
                  Membership Package Only
                </SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setSubCategoryFilter("all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Category</SelectItem>
                {categories.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={subCategoryFilter}
              onValueChange={(v) => {
                setSubCategoryFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Subcategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subcategory</SelectItem>
                {subCategories.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.sub_category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                loadProducts();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {column.product_sku && (
                    <TableHead className="text-center">Product SKU</TableHead>
                  )}
                  {column.product_description && (
                    <TableHead className="text-center">
                      Product Description
                    </TableHead>
                  )}
                  {column.product_type && (
                    <TableHead className="text-center">Type</TableHead>
                  )}
                  <TableHead className="text-center">Category</TableHead>
                  <TableHead className="text-center">Sub-category</TableHead>
                  <TableHead className="text-center">Item Charged</TableHead>
                  {column.product_gc_price && (
                    <TableHead className="text-center">GC Price</TableHead>
                  )}
                  {column.product_price && (
                    <TableHead className="text-center">Price</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow
                      key={p.item_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => editProduct(p.item_id)}
                    >
                      {column.product_sku && (
                        <TableCell className="text-center">
                          {p.item_sku || "—"}
                        </TableCell>
                      )}
                      {column.product_description && (
                        <TableCell
                          className="text-center max-w-[200px] truncate"
                          dangerouslySetInnerHTML={{
                            __html: (p.item_description || "").substring(0, 50),
                          }}
                        />
                      )}
                      {column.product_type && (
                        <TableCell className="text-center capitalize">
                          {p.item_type?.replace(/_/g, " ")}
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        {p.category_name || "--"}
                      </TableCell>
                      <TableCell className="text-center">
                        {p.sub_category_name || "--"}
                      </TableCell>
                      <TableCell className="text-center">
                        {(Number(p.item_charged) || 0).toFixed(2)}
                      </TableCell>
                      {column.product_gc_price && (
                        <TableCell className="text-center">
                          {(Number(p.item_gc_price) || 0).toFixed(2)}
                        </TableCell>
                      )}
                      {column.product_price && (
                        <TableCell className="text-center">
                          {(Number(p.item_price) || 0).toFixed(2)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Edit Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Product Information (
              {item.item_sku})
            </DialogTitle>
          </DialogHeader>
          <Tabs value={detailTab} onValueChange={setDetailTab}>
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="modify">Product Information</TabsTrigger>
              {action === "edit" && (
                <TabsTrigger value="discount">Discount</TabsTrigger>
              )}
              {action === "edit" && (
                <TabsTrigger value="inventory">Inventory & Codes</TabsTrigger>
              )}
              {hasDropshipping &&
                action === "edit" &&
                item.item_type === "product" && (
                  <TabsTrigger value="dropshipping_bonus">
                    {planStatus?.DROPSHIPPING_BONUS?.label ||
                      "Dropshipping Bonus"}
                  </TabsTrigger>
                )}
            </TabsList>

            {/* Product Information tab */}
            <TabsContent value="modify" className="mt-4 space-y-4">
              <div className="text-sm font-semibold text-muted-foreground border-b pb-2">
                Product Information
              </div>
              <div className="flex justify-center mb-4">
                <div
                  className="relative w-[150px] h-[150px] border rounded-md overflow-hidden cursor-pointer"
                  onClick={() => {
                    const input = document.getElementById(
                      "file-input",
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                >
                  {item.item_thumbnail ? (
                    <img
                      src={item.item_thumbnail}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      No Image
                    </div>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !token) return;
                      const formData = new FormData();
                      formData.append("upload", file);
                      formData.append("folder", "item_thumbnail");
                      try {
                        const res = await apiPost<any>(
                          "/api/upload",
                          formData,
                          token,
                        );
                        setItem((prev: any) => ({
                          ...prev,
                          item_thumbnail: res,
                        }));
                      } catch {
                        toast.error("Upload failed");
                      }
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Product SKU</Label>
                  <Input
                    value={item.item_sku}
                    onChange={(e) =>
                      setItem((p: any) => ({ ...p, item_sku: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Barcode</Label>
                  <Input
                    value={item.item_barcode}
                    onChange={(e) =>
                      setItem((p: any) => ({
                        ...p,
                        item_barcode: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price</Label>
                  <Input
                    value={item.item_price}
                    onChange={(e) =>
                      setItem((p: any) => ({
                        ...p,
                        item_price: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Product Description</Label>
                <div
                  className="border rounded-md p-2 min-h-[80px] text-sm"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const html = e.currentTarget.innerHTML;
                    setItem((p: any) => ({ ...p, item_description: html }));
                  }}
                  dangerouslySetInnerHTML={{
                    __html: item.item_description || "",
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Product Inclusion Details</Label>
                <div
                  className="border rounded-md p-2 min-h-[80px] text-sm"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const html = e.currentTarget.innerHTML;
                    setItem((p: any) => ({
                      ...p,
                      item_inclusion_details: html,
                    }));
                  }}
                  dangerouslySetInnerHTML={{
                    __html: item.item_inclusion_details || "",
                  }}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Item PV</Label>
                  <Input
                    value={item.item_pv}
                    onChange={(e) =>
                      setItem((p: any) => ({ ...p, item_pv: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Item Binary Points</Label>
                  <Input
                    value={item.item_binary_pts}
                    onChange={(e) =>
                      setItem((p: any) => ({
                        ...p,
                        item_binary_pts: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={item.item_type}
                    onValueChange={(v) =>
                      setItem((p: any) => ({ ...p, item_type: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">
                        Products/Items Only
                      </SelectItem>
                      <SelectItem value="membership_kit">
                        Membership Package Only
                      </SelectItem>
                      <SelectItem value="non_inventory">
                        Non Inventory
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={String(item.item_category)}
                    onValueChange={(v) => {
                      setItem((p: any) => ({
                        ...p,
                        item_category: v,
                        item_sub_category: "",
                      }));
                      getSubcategoryList(v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sub-Category</Label>
                  <Select
                    value={String(item.item_sub_category || "")}
                    onValueChange={(v) =>
                      setItem((p: any) => ({ ...p, item_sub_category: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.sub_category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Availability</Label>
                  <Select
                    value={item.availability}
                    onValueChange={(v) =>
                      setItem((p: any) => ({ ...p, availability: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="ecommerce">Ecommerce Only</SelectItem>
                      <SelectItem value="cashier">Cashier Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bind Membership</Label>
                  <Select
                    value={String(item.bind_membership_id)}
                    onValueChange={(v) =>
                      setItem((p: any) => ({ ...p, bind_membership_id: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="-1">All Membership</SelectItem>
                      {membershipList.map((m: any) => (
                        <SelectItem
                          key={m.membership_id}
                          value={String(m.membership_id)}
                        >
                          {m.membership_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Item Charged</Label>
                  <Input
                    value={item.item_charged}
                    onChange={(e) =>
                      setItem((p: any) => ({
                        ...p,
                        item_charged: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Qty Charged (%)</Label>
                  <Input
                    value={item.qty_charged}
                    onChange={(e) =>
                      setItem((p: any) => ({
                        ...p,
                        qty_charged: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {item.item_type === "membership_kit" && (
                <>
                  <div className="text-sm font-semibold text-muted-foreground border-b pb-2">
                    Membership Package Details
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Membership</Label>
                      <Select
                        value={String(item.membership_id)}
                        onValueChange={(v) =>
                          setItem((p: any) => ({ ...p, membership_id: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {membershipList.map((m: any) => (
                            <SelectItem
                              key={m.membership_id}
                              value={String(m.membership_id)}
                            >
                              {m.membership_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Slot Quantity</Label>
                      <Input
                        value={item.slot_qty}
                        onChange={(e) =>
                          setItem((p: any) => ({
                            ...p,
                            slot_qty: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Code User</Label>
                      <Select
                        value={item.code_user}
                        onValueChange={(v) =>
                          setItem((p: any) => ({ ...p, code_user: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Buyer Only</SelectItem>
                          <SelectItem value="everyone">Everyone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Upgrade</Label>
                      <Select
                        value={item.upgrade}
                        onValueChange={(v) =>
                          setItem((p: any) => ({ ...p, upgrade: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Yes</SelectItem>
                          <SelectItem value="0">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Use Kit To Upgrade Membership
                      </Label>
                      <Select
                        value={item.is_kit_upgrade}
                        onValueChange={(v) =>
                          setItem((p: any) => ({ ...p, is_kit_upgrade: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Yes</SelectItem>
                          <SelectItem value="0">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Inclusive Items</Label>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">
                              Item Name
                            </TableHead>
                            <TableHead className="text-center">
                              Item Quantity
                            </TableHead>
                            <TableHead className="text-center w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {item.item_kit?.map((k: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Select
                                  value={String(k.item_inclusive_id)}
                                  onValueChange={(v) => {
                                    const kit = [...item.item_kit];
                                    kit[i] = {
                                      ...kit[i],
                                      item_inclusive_id: v,
                                    };
                                    setItem((p: any) => ({
                                      ...p,
                                      item_kit: kit,
                                    }));
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {productList.map((p: any) => (
                                      <SelectItem
                                        key={p.item_id}
                                        value={String(p.item_id)}
                                      >
                                        {p.item_sku} (
                                        {p.item_description?.substring(0, 30)})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={k.item_qty}
                                  onChange={(e) => {
                                    const kit = [...item.item_kit];
                                    kit[i] = {
                                      ...kit[i],
                                      item_qty: e.target.value,
                                    };
                                    setItem((p: any) => ({
                                      ...p,
                                      item_kit: kit,
                                    }));
                                  }}
                                  className="text-center"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    i === item.item_kit.length - 1
                                      ? addItemKit(i)
                                      : deleteItemKit(i)
                                  }
                                >
                                  {i === item.item_kit.length - 1 ? (
                                    <Plus className="h-3 w-3 text-blue-600" />
                                  ) : (
                                    <X className="h-3 w-3 text-red-600" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Cancel
                </Button>
                {action === "edit" && item.archived === 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => handleArchive(item.item_id, false)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Archive
                  </Button>
                )}
                {action === "edit" && item.archived === 1 && (
                  <Button
                    variant="secondary"
                    onClick={() => handleArchive(item.item_id, true)}
                  >
                    <Undo2 className="h-4 w-4 mr-1" /> Restore
                  </Button>
                )}
                <Button onClick={handleSubmit} disabled={submitted}>
                  <Save className="h-4 w-4 mr-1" />{" "}
                  {submitted ? "Saving..." : "Save Product Information"}
                </Button>
              </div>
            </TabsContent>

            {/* Discount tab */}
            {action === "edit" && (
              <TabsContent value="discount" className="mt-4 space-y-4">
                <div className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Discount Per Membership
                </div>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">
                          Membership Name
                        </TableHead>
                        <TableHead className="text-center">
                          Discount (FIX)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.item_membership_discount?.map(
                        (d: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="text-center align-middle">
                              {d.membership_name}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={d.discount}
                                onChange={(e) => {
                                  const disc = [
                                    ...item.item_membership_discount,
                                  ];
                                  disc[i] = {
                                    ...disc[i],
                                    discount: e.target.value,
                                  };
                                  setItem((p: any) => ({
                                    ...p,
                                    item_membership_discount: disc,
                                  }));
                                }}
                                className="text-center"
                              />
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setDetailOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitted}>
                    {submitted ? "Saving..." : "Update Discount"}
                  </Button>
                </div>
              </TabsContent>
            )}

            {/* Inventory & Codes tab */}
            {action === "edit" && (
              <TabsContent value="inventory" className="mt-4 space-y-4">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/api/export/admin/item_inventory/xls?id=${item.item_id}`,
                        "_blank",
                      )
                    }
                  >
                    <FileSpreadsheet className="h-3 w-3 mr-1" /> Export
                    Inventory (Excel)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/api/export/admin/item_inventory/pdf?id=${item.item_id}`,
                        "_blank",
                      )
                    }
                  >
                    <FileText className="h-3 w-3 mr-1" /> Export Inventory (PDF)
                  </Button>
                </div>
                <div className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Inventory Per Branch or Stockist
                </div>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">
                          Stockist / Branch Name
                        </TableHead>
                        <TableHead className="text-center">Location</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">
                          Quantity
                          <br />
                          Sold
                        </TableHead>
                        <TableHead className="text-center">
                          Quantity
                          <br />
                          Used
                        </TableHead>
                        <TableHead className="text-center">
                          Quantity
                          <br />
                          Available
                        </TableHead>
                        <TableHead className="text-center">
                          Quantity
                          <br />
                          Unclaimed
                        </TableHead>
                        <TableHead className="text-center">
                          Quantity
                          <br />
                          Claimed
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branchList.length > 0 ? (
                        branchList.map((b: any, i: number) => (
                          <TableRow
                            key={i}
                            className={`cursor-pointer ${rowClicked === i ? "bg-muted" : ""}`}
                            onClick={() =>
                              changeItemBranch(
                                item.item_id,
                                b.inventory_id,
                                b.branch_name,
                                b.branch_id,
                                i,
                              )
                            }
                          >
                            <TableCell className="text-center">
                              {b.branch_name}
                            </TableCell>
                            <TableCell className="text-center">
                              {b.branch_location}
                            </TableCell>
                            <TableCell className="text-center">
                              {b.branch_type}
                            </TableCell>
                            <TableCell className="text-center">
                              {b.sold_codes}
                            </TableCell>
                            <TableCell className="text-center">
                              {b.used_codes}
                            </TableCell>
                            <TableCell className="text-center">
                              {b.inventory_quantity}
                            </TableCell>
                            <TableCell className="text-center">
                              {b.unclaimed}
                            </TableCell>
                            <TableCell className="text-center">
                              {b.claimed}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center text-muted-foreground"
                          >
                            No inventory data
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {itemCode && (
                  <>
                    <div className="text-sm font-semibold text-muted-foreground border-b pb-2">
                      {itemCodeSubmit.branch_name || "Branch"} Codes
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Select
                        value={itemCodeSubmit.status}
                        onValueChange={(v) => {
                          setItemCodeSubmit((f: any) => ({ ...f, status: v }));
                          loadItemCode({ ...itemCodeSubmit, status: v });
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Show All Codes</SelectItem>
                          <SelectItem value="Used">Used Codes Only</SelectItem>
                          <SelectItem value="Unused">
                            Unused Code Only
                          </SelectItem>
                          <SelectItem value="Sold">Sold Codes Only</SelectItem>
                          <SelectItem value="Unsold">
                            Unsold Codes Only
                          </SelectItem>
                          <SelectItem value="Archived">
                            Archived Codes Only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Search for code or name"
                        className="w-[200px]"
                        value={itemCodeSubmit.search || ""}
                        onChange={(e) => {
                          setItemCodeSubmit((f: any) => ({
                            ...f,
                            search: e.target.value,
                          }));
                          loadItemCode({
                            ...itemCodeSubmit,
                            search: e.target.value,
                          });
                        }}
                      />
                      <div className="flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `/api/export/item_code/csv?item_id=${item.item_id}&branch_id=${itemCodeSubmit.branch_id}`,
                            "_blank",
                          )
                        }
                      >
                        <FileSpreadsheet className="h-3 w-3 mr-1" /> Export to
                        Excel
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => generateCodeV2(item.item_id)}
                        disabled={submitted}
                      >
                        <QrCode className="h-3 w-3 mr-1" /> Generate Codes
                      </Button>
                    </div>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">Code</TableHead>
                            <TableHead className="text-center">Pin</TableHead>
                            <TableHead className="text-center">
                              Sold to
                            </TableHead>
                            <TableHead className="text-center">
                              Transfer to
                            </TableHead>
                            <TableHead className="text-center">
                              Used by
                            </TableHead>
                            <TableHead className="text-center w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        {codeLoading ? (
                          <TableBody>
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-4"
                              >
                                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        ) : (
                          <TableBody>
                            {(itemCode.data ?? []).length > 0 ? (
                              (itemCode.data ?? []).map((c: any, i: number) => (
                                <TableRow key={i}>
                                  <TableCell className="text-center font-mono">
                                    {c.code_activation}
                                  </TableCell>
                                  <TableCell className="text-center font-mono">
                                    {c.code_pin}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {c.code_org_buyer || "Unused"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {c.code_buyer
                                      ? c.code_buyer.name === c.code_org_buyer
                                        ? "--"
                                        : c.code_buyer.name
                                      : "Unused"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {c.code_user?.name || "Unused"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        deleteCode(
                                          c.code_id,
                                          c.code_archived === 1 ? 0 : 1,
                                        )
                                      }
                                    >
                                      {c.code_archived === 1 ? (
                                        <Undo2 className="h-3 w-3" />
                                      ) : (
                                        <X className="h-3 w-3 text-red-600" />
                                      )}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="text-center text-muted-foreground"
                                >
                                  No Data
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        )}
                      </Table>
                    </div>
                    {itemCode.last_page > 1 && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={(itemCode.current_page || 1) <= 1}
                          onClick={() =>
                            itemCodeGoToPage((itemCode.current_page || 1) - 1)
                          }
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <span className="text-sm text-muted-foreground self-center">
                          Page {itemCode.current_page || 1} of{" "}
                          {itemCode.last_page || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            (itemCode.current_page || 1) >=
                            (itemCode.last_page || 1)
                          }
                          onClick={() =>
                            itemCodeGoToPage((itemCode.current_page || 1) + 1)
                          }
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            )}

            {/* Dropshipping Bonus tab */}
            {hasDropshipping &&
              action === "edit" &&
              item.item_type === "product" && (
                <TabsContent
                  value="dropshipping_bonus"
                  className="mt-4 space-y-4"
                >
                  <div className="text-sm font-semibold text-muted-foreground border-b pb-2">
                    {planStatus?.DROPSHIPPING_BONUS?.label ||
                      "Dropshipping Bonus"}
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">
                            Membership of Recipient
                          </TableHead>
                          <TableHead className="text-center">
                            Commission Type
                          </TableHead>
                          <TableHead className="text-center">
                            Commission
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item.item_dropshipping_bonus?.map(
                          (d: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell className="text-center align-middle">
                                {d.membership_name}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={d.type || "fixed"}
                                  onValueChange={(v) => {
                                    const drop = [
                                      ...item.item_dropshipping_bonus,
                                    ];
                                    drop[i] = { ...drop[i], type: v };
                                    setItem((p: any) => ({
                                      ...p,
                                      item_dropshipping_bonus: drop,
                                    }));
                                  }}
                                >
                                  <SelectTrigger className="text-center">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="fixed">Fixed</SelectItem>
                                    <SelectItem value="percentage">
                                      Percentage
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={d.commission}
                                  onChange={(e) => {
                                    const drop = [
                                      ...item.item_dropshipping_bonus,
                                    ];
                                    drop[i] = {
                                      ...drop[i],
                                      commission: e.target.value,
                                    };
                                    setItem((p: any) => ({
                                      ...p,
                                      item_dropshipping_bonus: drop,
                                    }));
                                  }}
                                  className="text-center"
                                />
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setDetailOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitted}>
                      {submitted
                        ? "Saving..."
                        : `${action === "add" ? "Create" : "Update"} Commission`}
                    </Button>
                  </div>
                </TabsContent>
              )}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Manage Columns modal */}
      <Dialog open={columnOpen} onOpenChange={setColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Columns</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "product_sku", label: "Product SKU" },
              { key: "product_description", label: "Product Description" },
              { key: "product_type", label: "Product Type" },
              { key: "product_price", label: "Product Price" },
              { key: "product_gc_price", label: "Product GC Price" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  checked={column[key]}
                  onCheckedChange={(v) =>
                    setColumn((prev: any) => ({ ...prev, [key]: v === true }))
                  }
                  id={key}
                />
                <Label htmlFor={key} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColumnOpen(false)}>
              Close
            </Button>
            <Button onClick={columnSave}>
              <Columns3 className="h-4 w-4 mr-1" /> Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Codes modal */}
      <Dialog open={genCodeOpen} onOpenChange={setGenCodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <QrCode className="h-4 w-4 inline mr-1" /> GENERATE CODE
            </DialogTitle>
          </DialogHeader>
          {relKitItem?.rel_item_kit?.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">INCLUSIVE ITEMS</Label>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Item Name</TableHead>
                      <TableHead className="text-center">
                        Item Required
                      </TableHead>
                      <TableHead className="text-center">
                        Inventory Quantity
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relKitItem.rel_item_kit.map((k: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-center">
                          {k.item_sku}
                        </TableCell>
                        <TableCell className="text-center">
                          {k.item_qty}
                        </TableCell>
                        <TableCell className="text-center">
                          {k.inventory_quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <div className="text-center text-sm">
            You can generate code at the maximum of{" "}
            <span className="text-red-600 font-bold">
              {relKitItem?.max_code || 0}
            </span>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">ENTER NUMBER OF CODE TO GENERATE</Label>
            <Input
              type="number"
              min={0}
              max={relKitItem?.max_code || 0}
              value={generateCodes.number_of_codes}
              onChange={(e) =>
                setGenerateCodes((p: any) => ({
                  ...p,
                  number_of_codes: e.target.value,
                }))
              }
              className="text-center"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenCodeOpen(false)}>
              Close
            </Button>
            <Button onClick={generateCodeSubmit} disabled={generateSubmit}>
              <QrCode className="h-4 w-4 mr-1" />{" "}
              {generateSubmit ? "Generating..." : "GENERATE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stocks Report Modal */}
      <Dialog open={stocksOpen} onOpenChange={setStocksOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Report for Current Stocks</DialogTitle>
          </DialogHeader>
          {stocksData[0]?.branch_name && (
            <h2 className="text-center font-semibold text-lg">
              {stocksData[0].branch_name}
            </h2>
          )}
          <div className="flex gap-2 mb-3">
            <Select
              value={inventoryFilter.type}
              onValueChange={(v) => {
                setInventoryFilter((f: any) => ({ ...f, type: v }));
                setStocksLoading(true);
                recountInventory().then(() => {
                  apiPost<any>(
                    "/api/product/check_stocks",
                    { ...inventoryFilter, type: v },
                    token,
                  )
                    .then((res) => {
                      setStocksData(Array.isArray(res) ? res : []);
                    })
                    .finally(() => setStocksLoading(false));
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Type</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="membership_kit">
                  Membership Package
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Search Item Name"
              className="flex-1"
              value={inventoryFilter.search || ""}
              onChange={(e) =>
                setInventoryFilter((f: any) => ({
                  ...f,
                  search: e.target.value,
                }))
              }
              onBlur={(e) => {
                const val = e.target.value;
                setStocksLoading(true);
                recountInventory().then(() => {
                  apiPost<any>(
                    "/api/product/check_stocks",
                    { ...inventoryFilter, search: val },
                    token,
                  )
                    .then((res) => {
                      setStocksData(Array.isArray(res) ? res : []);
                    })
                    .finally(() => setStocksLoading(false));
                });
              }}
            />
          </div>
          {stocksLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Item Name</TableHead>
                    <TableHead className="text-center">Quantity Sold</TableHead>
                    <TableHead className="text-center">
                      Quantity Remaining
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocksData.length > 0 ? (
                    stocksData.map((s: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-center">
                          {s.item_sku || s.name || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {s.inventory_sold || s.qty_sold || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {s.inventory_quantity || s.qty_remaining || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-red-600"
                      >
                        <i className="fa fa-exclamation-circle" /> No Data Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
