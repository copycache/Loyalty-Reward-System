"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

interface Product {
  item_id: number;
  item_sku: string;
  item_price: number;
  item_thumbnail: string;
  encrypt_id: string;
}

interface StoreLinkData {
  slot_info: {
    name: string;
    slot_no: string;
    profile_picture: string;
  };
  products: Product[];
  landing_packages: unknown[];
}

export default function StoreLinkPage() {
  const params = useParams();
  const [data, setData] = useState<StoreLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const slotNo = params.slot_no as string;
    apiPost<StoreLinkData>("/api/landing/get_store_data", { slot_no: slotNo })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.slot_no]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded mx-auto" />
          <div className="h-4 w-64 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Store not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Store Header */}
      <section className="py-12 bg-linear-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 text-center">
          {data.slot_info.profile_picture && (
            <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary">
              <Image src={data.slot_info.profile_picture} alt={data.slot_info.name} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-bold">{data.slot_info.name}&apos;s Store</h1>
          <p className="text-muted-foreground text-sm">@{data.slot_info.slot_no}</p>
        </div>
      </section>

      {/* Products */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.products?.map((product) => (
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
        </div>
      </section>
    </div>
  );
}
