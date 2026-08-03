"use client";

import { useEffect, useState, useCallback } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Search, Plus, Minus, ChevronLeft, ChevronRight, Filter, Share2 } from "lucide-react";
import Link from "next/link";
import { BranchSelector } from "@/components/member/shopping/BranchSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MemberShoppingPage() {
  const { token, currentSlot } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [branchId, setBranchId] = useState<string>("");
  const [activeType, setActiveType] = useState("products");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const loadProducts = useCallback(async () => {
      setLoading(true);
      try {
          const params: any = {
              slot_id: currentSlot?.slot_id,
              type: activeType,
              page: page,
              branch: branchId
          };

          if (activeCategory !== "all") {
              params.item_category = activeCategory;
          }
          if (search) {
              params.search = search;
          }

          const res = await apiPost("/api/member/get_all_products", params, token);
          if (res?.data) {
              const data = res.data.data || res.data;
              const meta = res.data; 
              
              if (Array.isArray(data)) {
                  setProducts(data);
              } else {
                  setProducts([]);
              }

              if (meta?.last_page) {
                  setTotalPages(meta.last_page);
              }
          }
      } catch (e) {
          console.error("Failed to load products", e);
      }
      setLoading(false);
  }, [token, currentSlot, page, branchId, activeCategory, search, activeType]);

  useEffect(() => {
    if (!token) return;
    
    // Initial Load of Categories & Cart
    const loadInit = async () => {
      try {
        const [catRes, cartRes] = await Promise.all([
          apiPost("/api/shopping/get_category_list", {}, token),
          apiPost("/api/cart/get_cart_items", { slot_owner: currentSlot?.slot_owner }, token),
        ]);
        if (catRes?.data) setCategories(catRes.data);
        if (cartRes?.data) setCart(Array.isArray(cartRes.data) ? cartRes.data : []);
      } catch {}
    };
    loadInit();
  }, [token]);

  // Trigger product load when interactions happen
  useEffect(() => {
      if (token && branchId) {
          loadProducts();
      }
  }, [loadProducts, token, branchId]);

  const addToCart = async (productId: number) => {
    setCartLoading(true);
    try {
      await apiPost("/api/cart/simple_add_to_cart", {
        product_id: productId,
        quantity: 1,
        slot_owner: currentSlot?.slot_owner,
      }, token);
      // Refresh cart
      const cartRes = await apiPost("/api/cart/get_cart_items", { slot_owner: currentSlot?.slot_owner }, token);
      if (cartRes) setCart(Array.isArray(cartRes) ? cartRes : cartRes.data || []);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart.");
    }
    setCartLoading(false);
  };

  const shareProduct = async (productId: number) => {
      try {
          const res = await apiPost("/api/member/get_product_link", { item_id: productId }, token);
          if (res?.link || res?.data) {
             const link = res.link || res.data;
             navigator.clipboard.writeText(link);
             toast.success("Product link copied to clipboard!");
          } else {
             toast.error("Could not generate link.");
          }
      } catch {
          toast.error("Failed to get product link.");
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
            <h1 className="text-2xl font-bold">E-Commerce</h1>
            <p className="text-muted-foreground text-sm">Browse and purchase products using your wallet.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <BranchSelector 
            selectedBranchId={branchId}
            onBranchChange={(id) => {
                setBranchId(id);
                setPage(1);
            }} 
          />
          
          <Button variant="outline" asChild size="sm">
            <Link href="/member/order">
              My Orders
            </Link>
          </Button>
          <Button asChild className="bg-green-600 hover:bg-green-700" size="sm">
            <Link href="/member/checkout">
              <ShoppingCart className="h-4 w-4 mr-1" />
              Cart ({cart.length})
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg shadow-sm border">
        {/* Type Toggle */}
        <div className="flex bg-muted rounded-md p-1 shrink-0">
            <button
                className={`px-3 py-1 text-sm font-medium rounded-sm transition-all ${activeType === 'products' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => { setActiveType('products'); setPage(1); }}
            >
                Products
            </button>
            <button
                className={`px-3 py-1 text-sm font-medium rounded-sm transition-all ${activeType === 'membership_kit' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => { setActiveType('membership_kit'); setPage(1); }}
            >
                Membership Kits
            </button>
        </div>

        <div className="relative w-full md:w-auto md:min-w-[250px]">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            placeholder="Search..."
            className="pl-9"
            value={search}
            onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
            }}
            />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
             <div className="flex gap-2">
                <Button
                    variant={activeCategory === "all" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => { setActiveCategory("all"); setPage(1); }}
                    className="whitespace-nowrap"
                >
                    All Categories
                </Button>
                {categories.map((cat: any) => (
                    <Button
                        key={cat.id}
                        variant={activeCategory === String(cat.id) ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => { setActiveCategory(String(cat.id)); setPage(1); }}
                        className="whitespace-nowrap"
                    >
                        {cat.name}
                    </Button>
                ))}
             </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed">
            <div className="flex justify-center mb-4">
                <Search className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
             {!branchId && (
                 <p className="text-yellow-600 mt-2 text-sm">Please select a branch to view products.</p>
             )}
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product: any) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="aspect-square relative bg-muted group">
                    <img
                    src={product.photo ? `${apiUrl}/storage/${product.photo}` : "/admin/img/noimage.png"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/admin/img/noimage.png";
                    }}
                    />
                    {product.is_new && (
                    <Badge className="absolute top-2 left-2 bg-green-600">New</Badge>
                    )}
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            shareProduct(product.id);
                        }}
                        className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                        title="Share Product"
                    >
                        <Share2 className="h-4 w-4" />
                    </button>
                </div>
                <CardContent className="p-4 space-y-3 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <div className="flex justify-between items-start gap-2 mb-1">
                             <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                             <Badge variant="outline" className="text-[10px] shrink-0">{product.points || 0} pts</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-2 border-t">
                    <div>
                        <p className="text-lg font-bold text-green-700">
                        ₱{parseFloat(product.member_price || product.price || 0).toLocaleString()}
                        </p>
                        {product.srp && parseFloat(product.srp) > parseFloat(product.member_price || product.price) && (
                        <p className="text-xs text-muted-foreground line-through">
                            ₱{parseFloat(product.srp).toLocaleString()}
                        </p>
                        )}
                    </div>
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => addToCart(product.id)}
                        disabled={cartLoading}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </>
      )}
    </div>
  );
}
