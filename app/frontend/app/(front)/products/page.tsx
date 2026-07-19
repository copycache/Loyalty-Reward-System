"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: number;
  category_name: string;
}

interface Product {
  item_id: number;
  item_sku: string;
  item_price: number;
  item_thumbnail: string;
  encrypt_id: string;
}

const ITEMS_PER_PAGE = 8;

export default function ProductsPage() {
  const [categories, setCategories] = useState<{ other_category: Category[] } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | number>("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCartStore();

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  useEffect(() => {
    apiPost<{ other_category: Category[] }>("/api/landing/get_category_list", {})
      .then((data) => {
        setCategories(data);
        loadProducts("all");
      })
      .catch(console.error);
  }, []);

  const loadProducts = (type: string | number) => {
    setActiveCategory(type);
    setCurrentPage(1);
    setLoading(true);
    apiPost<{ product: Product[] }>("/api/landing/get_all_products", { type })
      .then((data) => {
        setProducts(data.product || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product.item_id);
    toast.success("The item has been successfully added to your cart");
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Category Tabs */}
        <nav className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => loadProducts("all")}
            >
              ALL
            </Button>
            {categories?.other_category?.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => loadProducts(cat.id)}
                className="capitalize"
              >
                {cat.category_name}
              </Button>
            ))}
          </div>
        </nav>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No products found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedProducts.map((product, i) => (
                <Card
                  key={product.item_id}
                  className="overflow-hidden group hover:shadow-lg transition-shadow"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-100">
                    {product.item_thumbnail && (
                      <Image
                        src={product.item_thumbnail}
                        alt={product.item_sku}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-medium text-sm truncate">{product.item_sku}</h3>
                    <p className="text-primary font-bold">
                      ₱{product.item_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/product/view/${product.encrypt_id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {products.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-9"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
