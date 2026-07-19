"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Trash2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export function CartSheet({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { cartItems, total, cartCount, isOpen, changeQty, removeFromCart, openCart, closeCart } =
    useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-120 flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-12">
              <ShoppingBag className="h-16 w-16 opacity-30" />
              <p className="font-semibold">Your cart is empty!</p>
              <p className="text-sm text-center">
                You have no items in your shopping cart.
                <br />
                Let&apos;s go buy something!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={item.item_id}
                  className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden bg-white">
                    {item.item_thumbnail && (
                      <Image
                        src={item.item_thumbnail}
                        alt={item.item_sku}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.item_sku}</p>
                    <p className="text-sm text-muted-foreground">
                      PHP {(item.discounted_price || item.item_price || 0).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.item_qty}
                        onChange={(e) =>
                          changeQty(item.item_id, parseInt(e.target.value) || 1)
                        }
                        className="w-16 h-8 text-center text-sm"
                      />
                      <span className="text-sm font-semibold ml-auto">
                        PHP {((item.discounted_price || item.item_price || 0) * item.item_qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8 self-start"
                    onClick={() => removeFromCart(item.item_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <SheetFooter className="border-t p-4 flex-col gap-3">
            <Separator />
            <div className="flex justify-between items-center w-full">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">PHP {total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  closeCart();
                  router.push("/product/checkout");
                }}
              >
                Checkout
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
