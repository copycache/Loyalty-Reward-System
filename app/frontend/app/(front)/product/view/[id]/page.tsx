"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { apiPost, resolveAssetUrl } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProductInfo {
  status: string;
  item_id: number;
  item_sku: string;
  item_price: number;
  discounted_price?: number;
  item_thumbnail: string;
  item_description: string;
  encrypt_id: string;
  item_name: string;
  item_category: string;
  inventory_quantity: number;
  quantity: number;
}

interface SimilarProduct {
  item_id: number;
  item_sku: string;
  item_price: number;
  discounted_price?: number;
  item_thumbnail: string;
  encrypt_id: string;
}

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const { addToCart, changeQty } = useCartStore();

  const loadProduct = (itemId: string) => {
    setLoading(true);
    apiPost<ProductInfo>("/api/landing/getProduct_info", { item_id: itemId })
      .then((data) => {
        setProduct(data);
        setQty(1);
        setExpanded(false);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (data.status === "valid") {
          apiPost<{ product: SimilarProduct[] }>("/api/landing/getProduct", {
            item_id: data.item_id,
          })
            .then((res) => setSimilarProducts(res.product || []))
            .catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const increaseQuantity = () => {
    if (product && product.inventory_quantity > qty) {
      setQty(qty + 1);
    } else {
      toast.error("Not enough inventory.");
    }
  };

  const decreaseQuantity = () => {
    if (qty > 1) {
      setQty(qty - 1);
    } else {
      toast.error("The quantity must not be less than 1.");
    }
  };

  const handleAddToCart = () => {
    if (!product || qty <= 0) return;
    const existingQty = useCartStore
      .getState()
      .items.filter((id) => id === product.item_id).length;
    if (existingQty > 0) {
      changeQty(product.item_id, existingQty + qty);
    } else {
      addToCart(product.item_id);
      if (qty > 1) {
        changeQty(product.item_id, qty);
      }
    }
    setQty(1);
    toast.success("The item has been successfully added to your cart");
  };

  const handleOrderNow = () => {
    handleAddToCart();
    setTimeout(() => {
      const cartBtn = document.querySelector("[data-cart-trigger]") as HTMLButtonElement;
      if (cartBtn) cartBtn.click();
    }, 300);
  };

  const showReadMore =
    product?.item_description && product.item_description.length > 1056;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || product.status === "invalid") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-lg mb-4">Product not found.</p>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100">
          <Image
            src={resolveAssetUrl(product.item_thumbnail)}
            alt={product.item_sku}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold uppercase">{product.item_sku}</h1>
          <p className="text-3xl font-bold text-primary">
            ₱{" "}
            {(product.discounted_price || product.item_price).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button size="lg" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              ADD TO CART
            </Button>
            <Button size="lg" variant="outline" onClick={handleOrderNow}>
              ORDER NOW
            </Button>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={decreaseQuantity}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <input
                type="number"
                className="w-16 text-center border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={1}
                value={qty}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1) {
                    if (product.inventory_quantity && val > product.inventory_quantity) {
                      toast.error("Not enough inventory.");
                      setQty(product.inventory_quantity);
                    } else {
                      setQty(val);
                    }
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={increaseQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {product.item_description && (
            <div>
              <h3 className="font-semibold mb-2">Description:</h3>
              <div
                ref={descRef}
                className="prose prose-sm max-w-none text-muted-foreground overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: !expanded && showReadMore ? "200px" : undefined,
                }}
                dangerouslySetInnerHTML={{ __html: product.item_description }}
              />
              {showReadMore && (
                <Button
                  variant="link"
                  className="px-0 mt-1"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "...Read Less" : "Read More..."}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border" />
            <h2 className="text-lg font-semibold whitespace-nowrap">Similar Products</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((sp) => (
              <div
                key={sp.item_id}
                className="group cursor-pointer"
                onClick={() => router.push(`/product/view/${sp.encrypt_id}`)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 mb-3">
                  <Image
                    src={resolveAssetUrl(sp.item_thumbnail)}
                    alt={sp.item_sku}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </span>
                  </div>
                </div>
                <p className="font-semibold text-sm">
                  ₱{" "}
                  {(sp.discounted_price || sp.item_price).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-sm text-muted-foreground">{sp.item_sku}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(sp.item_id);
                    toast.success("Item added to cart");
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
