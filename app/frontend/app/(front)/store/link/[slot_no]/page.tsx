"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from "lucide-react";
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
  item_points_currency?: string;
}

interface StoreCheckData {
  is_valid: string;
  slot_no?: string;
  slot_id?: number;
  store_name?: string;
}

const ITEMS_PER_PAGE = 8;

export default function StoreLinkPage() {
  const params = useParams();
  const [isValid, setIsValid] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [slotNoCrypt, setSlotNoCrypt] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ other_category: Category[] } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | number>("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCartStore();

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    const slotNo = params.slot_no as string;

    // Check store link validity
    apiPost<StoreCheckData>("/api/store/check_store_link", { slot_no: slotNo })
      .then((data) => {
        setIsValid(data.is_valid);
        if (data.is_valid === "valid") {
          setStoreName(data.store_name || "");
          setSlotNoCrypt(data.slot_no || null);
        }
      })
      .catch(() => setIsValid("invalid"));

    // Load categories
    apiPost<{ other_category: Category[] }>("/api/landing/get_category_list", {})
      .then((data) => {
        setCategories(data);
      })
      .catch(console.error);

    // Load products
    apiPost<{ product: Product[] }>("/api/landing/get_all_products", { type: "all" })
      .then((data) => {
        setProducts(data.product || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slot_no]);

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

  // Invalid state
  if (isValid === "invalid") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Image
          src="/images/bad_request/404.png"
          alt="Store not found"
          width={400}
          height={300}
          className="mx-auto object-contain"
        />
      </div>
    );
  }

  // Loading state
  if (isValid === null || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-8 w-48 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  const storeLink = slotNoCrypt
    ? `${window.location.origin}/member/register/referral/${slotNoCrypt}`
    : "#";

  return (
    <div>
      {/* Promo Banner */}
      <section className="bg-linear-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src="/images/Landing-Page/client-resources/sl-003.png"
                alt="Store Banner"
                width={600}
                height={400}
                className="object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">Welcome to</h1>
              <h2 className="text-2xl font-semibold text-primary capitalize mb-6">
                {storeName}
              </h2>
              {slotNoCrypt && (
                <Button asChild size="lg">
                  <a href={storeLink} target="_blank" rel="noopener noreferrer">
                    Join Now
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8">
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
          {products.length === 0 ? (
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
                    <Link href={`/product/view/${product.encrypt_id}`}>
                      <div className="relative aspect-square overflow-hidden bg-zinc-100">
                        {product.item_thumbnail && (
                          <Image
                            src={product.item_thumbnail}
                            alt={product.item_sku}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-medium text-sm truncate">{product.item_sku}</h3>
                      {/* Star Ratings */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-primary font-bold">
                        {product.item_points_currency || "₱"}
                        {product.item_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
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
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
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
      </section>
    </div>
  );
}
