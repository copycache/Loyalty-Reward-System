"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, ShoppingCart, ShoppingBag, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ProductInfo {
  item_id: number;
  item_sku: string;
  item_name?: string;
  item_price: number;
  discounted_price?: number;
  item_gc_price?: number;
  item_pv: number;
  item_description: string;
  item_thumbnail: string;
  item_type?: string;
  direct_cashback_membership?: number;
  item_ratings?: {
    rating_average: number;
    rating_count: number;
    rating_list?: any[];
  };
}

interface Location {
  branch_id: number;
  branch_name: string;
  branch_type: string;
  branch_location: string;
}

interface ItemVariation {
  id: number;
  item_name: string;
  is_multiple: boolean;
  archive: number;
  variations: { id: number; variation_name: string; archive: number; selected?: boolean }[];
}

export default function MemberShoppingProductPage() {
  const params = useParams();
  const router = useRouter();
  const { token, currentSlot } = useAuthStore();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [variations, setVariations] = useState<ItemVariation[]>([]);
  const [planStatus, setPlanStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    if (!token || !productId) return;

    const loadData = async () => {
      try {
        const [productRes, locationRes, variationRes, planRes] = await Promise.all([
          apiPost("/api/member/get_product", { item_id: productId, slot_id: currentSlot?.slot_id }, token),
          apiPost("/api/cart/get_location", {}, token),
          apiPost("/api/member/get_product_item_variation", { item_id: productId }, token).catch(() => []),
          apiPost("/api/plan/get_status", { plan: "DIRECT_PERSONAL_CASHBACK" }, token).catch(() => null),
        ]);

        if (productRes) setProduct(productRes);
        if (locationRes) setLocations(Array.isArray(locationRes) ? locationRes : locationRes?.data || []);
        if (planRes) setPlanStatus(planRes);

        // Process variations
        if (Array.isArray(variationRes) && variationRes.length > 0) {
          const items = variationRes.map((item: any) => ({
            ...item,
            is_multiple: item.is_multiple === 1,
            variations: [],
          }));

          // Load variations for each item
          for (const item of items) {
            try {
              const varRes = await apiPost("/api/member/get_product_variation", { item_variation_id: item.id }, token);
              if (Array.isArray(varRes)) {
                item.variations = varRes.map((v: any) => ({
                  id: v.id,
                  variation_name: v.variation_name,
                  archive: v.archive,
                  selected: false,
                }));
              }
            } catch {
              // ignore variation load errors
            }
          }
          setVariations(items);
        }
      } catch {
        console.error("Failed to load product data");
      }
      setLoading(false);
    };
    loadData();
  }, [token, productId]);

  const addToCart = async () => {
    if (!product) return;
    setCartLoading(true);
    try {
      await apiPost("/api/cart/simple_add_to_cart", {
        product_id: product.item_id,
        quantity: 1,
        slot_owner: currentSlot?.slot_owner,
      }, token);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart.");
    }
    setCartLoading(false);
  };

  const buyNow = async () => {
    if (!product) return;
    setCartLoading(true);
    try {
      await apiPost("/api/cart/simple_add_to_cart", {
        product_id: product.item_id,
        quantity: 1,
        slot_owner: currentSlot?.slot_owner,
      }, token);
      router.push("/member/checkout");
    } catch {
      toast.error("Failed to process. Please try again.");
    }
    setCartLoading(false);
  };

  const formatPrice = (value: number | undefined) => {
    if (!value && value !== 0) return "0.00";
    return parseFloat(String(value)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const toggleVariation = (itemIndex: number, variationIndex: number) => {
    setVariations((prev) => {
      const updated = [...prev];
      const item = { ...updated[itemIndex] };
      const vars = [...item.variations];

      if (item.is_multiple) {
        vars[variationIndex] = { ...vars[variationIndex], selected: !vars[variationIndex].selected };
      } else {
        // Single select: deselect all, select this one
        vars.forEach((v, i) => {
          vars[i] = { ...v, selected: i === variationIndex ? !v.selected : false };
        });
      }

      item.variations = vars;
      updated[itemIndex] = item;
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground py-10">Product not found.</p>
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/member/shopping">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discounted_price !== undefined && product.discounted_price !== product.item_price;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/member/shopping">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Product Profile */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold uppercase tracking-wide text-muted-foreground mb-4">
                Product Profile
              </h2>

              <div className="flex flex-col sm:flex-row gap-6">
                {/* Product Image */}
                <div className="w-full sm:w-48 flex-shrink-0">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={product.item_thumbnail || "/images/placeholder.png"}
                      alt={product.item_sku}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/placeholder.png";
                      }}
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold">{product.item_sku}</h3>

                  {/* Pricing */}
                  <div className="space-y-1">
                    {hasDiscount && (
                      <p className="text-sm text-red-500 line-through">
                        PHP {formatPrice(product.item_price)}
                      </p>
                    )}
                    <p className="text-xl font-bold text-green-700">
                      PHP {formatPrice(hasDiscount ? product.discounted_price : product.item_price)}
                    </p>
                    {product.item_gc_price && product.item_gc_price > 0 && (
                      <p className="text-lg font-semibold text-green-600">
                        GC {formatPrice(product.item_gc_price)}
                      </p>
                    )}
                    {product.item_type !== "membership_kit" && (
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(product.item_pv)} PV
                      </p>
                    )}
                  </div>

                  {/* Cashback */}
                  {planStatus?.status === 1 && product.direct_cashback_membership && (
                    <p className="text-sm text-green-600">
                      Personal Cashback Points: PHP {product.direct_cashback_membership}
                    </p>
                  )}

                  {/* Variations */}
                  {variations.filter((v) => v.archive !== 1).map((item, itemIdx) => (
                    <div key={item.id} className="space-y-2">
                      <p className="font-semibold text-sm">{item.item_name}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.variations
                          .filter((v) => v.archive !== 1)
                          .map((variation, varIdx) => (
                            <Badge
                              key={variation.id}
                              variant={variation.selected ? "default" : "secondary"}
                              className={`cursor-pointer transition-colors ${
                                variation.selected
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "hover:bg-muted-foreground/20"
                              }`}
                              onClick={() => toggleVariation(itemIdx, varIdx)}
                            >
                              {variation.variation_name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  ))}

                  <Separator />

                  {/* Description */}
                  <div
                    className="text-sm text-muted-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.item_description || "No description available." }}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={buyNow}
                      disabled={cartLoading}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <ShoppingBag className="h-4 w-4 mr-1" /> Buy Now
                    </Button>
                    <Button
                      onClick={addToCart}
                      disabled={cartLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pickup Locations */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold uppercase tracking-wide text-muted-foreground mb-4">
                Pickup Location
              </h2>

              {locations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pickup locations available.</p>
              ) : (
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div key={location.branch_id} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {location.branch_name}-{location.branch_type}
                        </p>
                        <p className="text-xs text-muted-foreground">{location.branch_location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
