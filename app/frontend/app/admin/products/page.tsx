"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
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
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Package,
  Archive,
  ArchiveRestore,
  BarChart3,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Product {
  item_id: number;
  item_sku: string;
  item_name: string;
  item_type: string;
  item_price: string | number;
  item_category: number;
  item_sub_category: number;
  category_name: string;
  subcategory_name: string;
  archived: number;
  [key: string]: any;
}

export default function AdminProductsPage() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");

  // Product detail modal
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [detailTab, setDetailTab] = useState("info");

  // Inventory & codes modal
  const [inventory, setInventory] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);

  // Stocks report modal
  const [stocksOpen, setStocksOpen] = useState(false);
  const [stocksData, setStocksData] = useState<any[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const body: any = {
        page,
        search_key: search,
        per_page: 15,
      };
      if (typeFilter) body.item_type = typeFilter;
      if (categoryFilter) body.item_category = categoryFilter;

      const res = await apiPost<any>("/api/product/get", body, token);
      if (res?.data) {
        setProducts(res.data);
        setTotalPages(res.last_page || 1);
        setTotal(res.total || res.data.length);
      } else if (Array.isArray(res)) {
        setProducts(res);
        setTotalPages(1);
        setTotal(res.length);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products");
    }
    setLoading(false);
  }, [token, page, search, typeFilter, categoryFilter]);

  const loadCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiPost<any>("/api/product/get_category_list", {}, token);
      if (Array.isArray(res)) setCategories(res);
    } catch {
      // optional
    }
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openDetail = async (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
    setDetailTab("info");
    try {
      const data = await apiPost<any>(
        "/api/product/data",
        { id: product.item_id },
        token
      );
      setProductData(data);
    } catch {
      setProductData(null);
    }
  };

  const loadInventory = async (productId: number) => {
    try {
      const inv = await apiPost<any>(
        "/api/product/get_item_inventory",
        { id: productId },
        token
      );
      setInventory(Array.isArray(inv) ? inv : []);
    } catch {
      setInventory([]);
    }
  };

  const loadCodes = async (productId: number) => {
    try {
      const c = await apiPost<any>(
        "/api/product/get_item_code",
        { item_id: productId },
        token
      );
      setCodes(Array.isArray(c?.data || c) ? (c?.data || c) : []);
    } catch {
      setCodes([]);
    }
  };

  const handleDetailTab = async (tab: string) => {
    setDetailTab(tab);
    if (!selectedProduct) return;
    if (tab === "inventory") {
      loadInventory(selectedProduct.item_id);
      loadCodes(selectedProduct.item_id);
    }
  };

  const handleArchive = async (productId: number, isArchived: boolean) => {
    if (!token) return;
    try {
      const endpoint = isArchived ? "/api/product/unarchive" : "/api/product/archive";
      await apiPost(endpoint, { id: productId }, token);
      toast.success(isArchived ? "Product restored" : "Product archived");
      loadProducts();
      setDetailOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update product");
    }
  };

  const handleCheckStocks = async () => {
    if (!token) return;
    setStocksOpen(true);
    setStocksLoading(true);
    try {
      const res = await apiPost<any>("/api/product/check_stocks", {}, token);
      setStocksData(Array.isArray(res) ? res : []);
    } catch {
      setStocksData([]);
    }
    setStocksLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage products and inventory ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCheckStocks}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Stocks Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                loadProducts();
              }}
              className="flex gap-2 flex-1 min-w-[250px]"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by SKU, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <Select
              value={typeFilter || "all"}
              onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="membership">Membership Package</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter || "all"}
              onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name || c.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => { setPage(1); loadProducts(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.item_id}>
                    <TableCell className="font-medium">{p.item_sku || "—"}</TableCell>
                    <TableCell>{p.item_name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.item_type || "product"}</Badge>
                    </TableCell>
                    <TableCell>{p.category_name || "—"}</TableCell>
                    <TableCell className="font-medium">₱{p.item_price}</TableCell>
                    <TableCell>
                      {p.archived ? (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archived</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(p)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(p.item_id, !!p.archived)}
                      >
                        {p.archived ? (
                          <ArchiveRestore className="h-4 w-4 text-green-600" />
                        ) : (
                          <Archive className="h-4 w-4 text-red-600" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details — {selectedProduct?.item_sku}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={detailTab} onValueChange={handleDetailTab}>
            <TabsList>
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="inventory">Inventory & Codes</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              {productData ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["SKU", productData.item_sku],
                    ["Name", productData.item_name],
                    ["Type", productData.item_type],
                    ["Category", productData.category_name],
                    ["Subcategory", productData.subcategory_name],
                    ["Price", `₱${productData.item_price || 0}`],
                    ["GC Price", `₱${productData.item_gc_price || 0}`],
                    ["PV", productData.item_pv || "0"],
                    ["Item Charged", productData.item_charged],
                    ["Binary Points", productData.item_binary_pts || "0"],
                    ["Status", productData.archived ? "Archived" : "Active"],
                    ["Created", productData.created_at ? new Date(productData.created_at).toLocaleDateString() : "—"],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase">{String(label)}</Label>
                      <p className="text-sm font-medium">{String(value ?? "—")}</p>
                    </div>
                  ))}
                  {productData.item_description && (
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase">Full Description</Label>
                      <p className="text-sm">{productData.item_description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="inventory" className="mt-4 space-y-6">
              {/* Inventory */}
              <div>
                <h3 className="font-semibold mb-2">Branch Inventory</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Sold/Used</TableHead>
                      <TableHead>Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.length > 0 ? (
                      inventory.map((inv: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{inv.branch_name || "—"}</TableCell>
                          <TableCell>{inv.location || "—"}</TableCell>
                          <TableCell>{inv.sold || inv.used || 0}</TableCell>
                          <TableCell>{inv.available || 0}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No inventory data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Codes */}
              <div>
                <h3 className="font-semibold mb-2">Product Codes</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Pin</TableHead>
                      <TableHead>Sold To</TableHead>
                      <TableHead>Used By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codes.length > 0 ? (
                      codes.slice(0, 50).map((c: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-sm">{c.code || "—"}</TableCell>
                          <TableCell className="font-mono text-sm">{c.pin || "—"}</TableCell>
                          <TableCell>{c.sold_to || "—"}</TableCell>
                          <TableCell>{c.used_by || "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No codes generated
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {codes.length > 50 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Showing first 50 of {codes.length} codes
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Stocks Report Modal */}
      <Dialog open={stocksOpen} onOpenChange={setStocksOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stocks Report</DialogTitle>
          </DialogHeader>
          {stocksLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Qty Sold</TableHead>
                  <TableHead>Qty Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocksData.length > 0 ? (
                  stocksData.map((s: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{s.item_name || s.name || "—"}</TableCell>
                      <TableCell>{s.qty_sold || 0}</TableCell>
                      <TableCell>{s.qty_remaining || 0}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No stock data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
