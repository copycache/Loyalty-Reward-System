"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Product {
  item_id: number;
  item_thumbnail: string;
  item_sku: string;
  item_category_name: string;
  item_pv: string | number;
  item_price: number;
  old_item_price: number;
  item_discount: number;
  url_sku: string;
  encrypt_id: string;
}

const BANNER_SLIDES = [
  "/images/front/slider-1.jpg",
  "/images/front/slider-2.jpg",
  "/images/front/slider-3.jpg",
];

const ITEMS_PER_PAGE = 8;

export default function ProductCategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ other_category: { id: number; category_name: string }[] } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCartStore();
  const sliderRef = useRef<HTMLDivElement>(null);
  const categoryName = (params.name as string).replace(/-/g, " ");

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    apiPost<{ other_category: { id: number; category_name: string }[] }>(
      "/api/landing/get_category_list",
      {}
    ).then((data) => {
      setCategories(data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setActiveCategory(categoryName === "all" ? "all" : categoryName);
    apiPost<{ product: Product[] }>("/api/landing/get_all_products", {
      type: categoryName === "all" ? "all" : categoryName,
    })
      .then((data) => {
        setProducts(data.product || []);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryName]);

  useEffect(() => {
    apiPost<Product[]>("/api/home/get_product_view", {})
      .then(setBestSellers)
      .catch(console.error);
  }, []);

  const loadProducts = (type: string) => {
    setActiveCategory(type);
    setCurrentPage(1);
    setLoading(true);
    apiPost<{ product: Product[] }>("/api/landing/get_all_products", {
      type: type === "all" ? "all" : type,
    })
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

  const goToSlide = (index: number) => setCurrentSlide(index);

  return (
    <div>
      {/* Swiper Slider */}
      <section className="relative overflow-hidden bg-zinc-900">
        <div className="relative h-[300px] md:h-[450px]" ref={sliderRef}>
          {BANNER_SLIDES.map((src, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: idx === currentSlide ? 1 : 0 }}
            >
              <Image
                src={src}
                alt={`Slide ${idx + 1}`}
                fill
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {BANNER_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === currentSlide ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li>/</li>
              <li><Link href="/products" className="hover:text-primary">Products</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium capitalize">{categoryName}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Category Tabs */}
              <div className="mb-6">
                <ul className="flex flex-wrap gap-1 border-b">
                  <li>
                    <button
                      onClick={() => loadProducts("all")}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeCategory === "all"
                          ? "text-primary border-b-2 border-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                  </li>
                  {categories?.other_category?.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => loadProducts(String(cat.id))}
                        className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                          activeCategory === String(cat.id)
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.category_name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {paginatedProducts.map((product, i) => (
                      <Card
                        key={product.item_id}
                        className="overflow-hidden group hover:shadow-lg transition-shadow"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <Link href={`/product/view/${product.url_sku || product.encrypt_id}`}>
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
                            {product.old_item_price > product.item_price && (
                              <div className="absolute top-2 left-2 bg-destructive text-white text-xs font-bold px-2 py-1 rounded">
                                Save {product.item_discount}%
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                View
                              </span>
                            </div>
                          </div>
                        </Link>
                        <CardContent className="p-4 space-y-2">
                          <p className="text-xs text-muted-foreground uppercase">
                            {product.item_category_name}
                          </p>
                          <h3 className="font-medium text-sm truncate">
                            {product.item_sku}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Points Value: {product.item_pv || 0}
                          </p>
                          <div>
                            <p className="text-primary font-bold text-lg">
                              &#8369;{product.item_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </p>
                            {product.old_item_price > product.item_price && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground line-through">
                                  &#8369;{product.old_item_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                </span>
                                <span className="text-xs text-destructive font-medium">
                                  {product.item_discount}% off
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </Button>
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

            {/* Sidebar - Best Seller Products */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <h3 className="font-bold text-lg mb-4 pb-2 border-b">Best Seller Products</h3>
                <div className="space-y-4">
                  {bestSellers?.slice(0, 8).map((prod) => (
                    <Link
                      key={prod.item_id}
                      href={`/product/view/${prod.url_sku || prod.encrypt_id}`}
                      className="flex gap-3 group"
                    >
                      <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-zinc-100">
                        <Image
                          src={prod.item_thumbnail}
                          alt={prod.item_sku}
                          fill
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {prod.item_sku}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prod.item_category_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Points Value: {prod.item_pv || 0}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-primary">
                            &#8369;{prod.item_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </span>
                          {prod.old_item_price > prod.item_price && (
                            <span className="text-xs text-muted-foreground line-through">
                              &#8369;{prod.old_item_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
