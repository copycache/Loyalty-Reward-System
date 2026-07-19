"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Product {
  item_id: number;
  item_sku: string;
  item_price: number;
  item_thumbnail: string;
  encrypt_id: string;
}

export default function ProductCategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();
  const categoryName = params.name as string;

  useEffect(() => {
    apiPost<{ product: Product[] }>("/api/landing/get_all_products", {
      type: categoryName,
    })
      .then((data) => {
        setProducts(data.product || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryName]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 capitalize">{categoryName} Products</h1>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.item_id} className="overflow-hidden group hover:shadow-lg transition-shadow">
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
              <CardContent className="p-4 space-y-2">
                <h3 className="font-medium text-sm truncate">{product.item_sku}</h3>
                <p className="text-primary font-bold">
                  ₱{product.item_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/product/view/${product.encrypt_id}`}>View</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      addToCart(product.item_id);
                      toast.success("Added to cart");
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
