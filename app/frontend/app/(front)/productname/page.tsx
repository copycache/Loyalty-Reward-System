"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";

interface BestSellerProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
}

const BEST_SELLERS: BestSellerProduct[] = [
  {
    id: 1,
    name: "ULTRA-MAGNETIC TRUST PERFUME",
    category: "Beauty Products",
    price: 1299,
    originalPrice: 4000,
    discount: 68,
    image: "/images/front/prod-01.png",
  },
  {
    id: 2,
    name: "I Have A Multi Millionaire Mind T-Shirt [BLACK]",
    category: "Clothing",
    price: 500,
    image: "/images/front/prod-02.png",
  },
  {
    id: 3,
    name: "AXIOM NATUR -Healthy Beverages (COFFEE)",
    category: "Coffee",
    price: 150,
    originalPrice: 250,
    discount: 40,
    image: "/images/front/prod-03.png",
  },
  {
    id: 4,
    name: "PERIPERA SPEEDY BROW CARA – NATURAL BROWN",
    category: "Beauty Products",
    price: 284,
    originalPrice: 385,
    discount: 26,
    image: "/images/front/prod-04.png",
  },
  {
    id: 5,
    name: "Pediafer Syrup 120mL",
    category: "Food Supplement",
    price: 497,
    originalPrice: 887,
    discount: 68,
    image: "/images/front/prod-05.png",
  },
  {
    id: 6,
    name: "ULTRA-MAGNETIC TRUST PERFUME",
    category: "Beauty Products",
    price: 1299,
    originalPrice: 4000,
    discount: 68,
    image: "/images/front/prod-01.png",
  },
];

export default function ProductnamePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currency, setCurrency] = useState("PHP");
  const { addToCart } = useCartStore();
  const sliderRef = useRef<HTMLDivElement>(null);

  const slidesPerView = 4;

  const totalBestSellerSlides = Math.ceil(BEST_SELLERS.length / slidesPerView);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalBestSellerSlides);
    }, 8000);
    return () => clearInterval(interval);
  }, [totalBestSellerSlides]);

  const goNext = () =>
    setCurrentSlide((prev) => (prev + 1) % totalBestSellerSlides);
  const goPrev = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + totalBestSellerSlides) % totalBestSellerSlides
    );

  const handleAddToCart = () => {
    addToCart(1);
    toast.success("The item has been successfully added to your cart");
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-primary">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-primary">Products</Link></li>
            <li>/</li>
            <li><Link href="/products/tools-for-success" className="hover:text-primary">Tools for Success</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">ULTRA-MAGNETIC TRUST PERFUME</li>
          </ol>
        </nav>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Product Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100">
            <Image
              src="/images/front/product-01.png"
              alt="ULTRA-MAGNETIC TRUST PERFUME"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full max-w-xs h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="PHP">Philippine Peso</option>
              <option value="USD">US Dollar</option>
            </select>

            <h1 className="text-2xl font-bold">ULTRA-MAGNETIC TRUST PERFUME</h1>
            <p className="text-muted-foreground">by Genius Creation Trading Inc.</p>
            <p className="text-sm text-muted-foreground uppercase">Tools for Success</p>

            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>DO YOU WANT TO MAKE PEOPLE LIKE & TRUST YOU INSTANTLY?! DO YOU WANT TO ATTRACT MORE BUSINESS & DRAMATICALLY INCREASE SALES?!</p>
              <p>ULTRA-MAGNETIC TRUST PERFUME IS NOW AVAILABLE!</p>
              <p>Get it now at 75% discount exclusively at www.successmall.ph for only P999 instead of P4000.</p>
              <p>This scientifically engineered perfume will make you instantly irresistible & influential to prospects in seconds!! Hurry and order yours today before it sold out this coming Christmas Season!</p>
              <p>Available in six scents: Touch of Pink, Incanto Shine, Happy, Cool Water, Light Blue and Jo Malone (Lotus Blossom & Water Lily) scent for women, Polo Sport, Cool Water CK1, Happy, Hugo and Jo Malone (Earl Gray) scent for men (50mL good for 1-3months depending on frequency of use).</p>
              <p>Hurry, limited supply only!</p>
              <p>For inquiries call (02) 8779479 and text 09206806346. Like us on www.facebook.com/successmallph</p>
            </div>

            <div className="space-y-1">
              <p className="text-lg text-muted-foreground line-through">
                &#8369;4,000.00
              </p>
              <p className="text-3xl font-bold text-primary">
                &#8369;1,299.00
              </p>
              <p className="text-sm font-semibold text-destructive">
                Save 68%
              </p>
            </div>

            <Button size="lg" className="w-full md:w-auto" onClick={handleAddToCart}>
              ADD TO CART
            </Button>
          </div>
        </div>

        {/* Divider with title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-border" />
          <h2 className="text-lg font-semibold whitespace-nowrap">Best Seller Products</h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Best Seller Swiper */}
        <div className="relative" ref={sliderRef}>
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalBestSellerSlides }).map((_, slideIdx) => (
                <div key={slideIdx} className="w-full shrink-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {BEST_SELLERS.slice(
                      slideIdx * slidesPerView,
                      slideIdx * slidesPerView + slidesPerView
                    ).map((item) => (
                      <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="relative aspect-square overflow-hidden bg-zinc-100">
                          {item.discount && (
                            <div className="absolute top-2 left-2 bg-destructive text-white text-xs font-bold px-2 py-1 rounded z-10">
                              Save {item.discount}%
                            </div>
                          )}
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              View
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-3 space-y-1">
                          <p className="text-xs text-muted-foreground uppercase">{item.category}</p>
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-primary font-bold">
                            &#8369;{item.price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </p>
                          {item.originalPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              &#8369;{item.originalPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </p>
                          )}
                          <Button size="sm" className="w-full" onClick={() => { addToCart(item.id); toast.success("Item added to cart"); }}>
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goPrev}
            className="absolute -left-3 top-1/2 -translate-y-1/2 bg-background border shadow-sm rounded-full p-2 hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-background border shadow-sm rounded-full p-2 hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
