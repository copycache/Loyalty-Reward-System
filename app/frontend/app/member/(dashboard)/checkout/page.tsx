"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Trash2, Minus, Plus } from "lucide-react";

export default function MemberCheckoutPage() {
  const router = useRouter();
  const { token, currentSlot } = useAuthStore();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Wallet");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const loadCart = async () => {
    try {
      const res = await apiPost<any>("/api/cart/get_cart_items", { slot_owner: currentSlot?.slot_owner }, token);
      if (res?.data) setCart(Array.isArray(res.data) ? res.data : []);
      else setCart([]);
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    if (!token || !currentSlot) return;
    const loadData = async () => {
      try {
        const [, addrRes] = await Promise.all([
          loadCart(),
          apiPost<any>("/api/settings/get_addresses", {}, token),
        ]);
        if (addrRes?.data) {
          setAddresses(Array.isArray(addrRes.data) ? addrRes.data : []);
          // Auto-select the default address
          const defaultAddr = (addrRes.data as any[]).find((a: any) => a.is_default == 1);
          if (defaultAddr) setSelectedAddress(String(defaultAddr.address_id));
        }
      } catch {
        console.error("Failed to load checkout data");
      }
      setLoading(false);
    };
    loadData();
  }, [token, currentSlot]);

  const updateQty = async (cartItemId: number, qty: number) => {
    if (qty < 1) return;
    try {
      await apiPost("/api/cart/update_cart_item", { id: cartItemId, quantity: qty }, token);
      await loadCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await apiPost("/api/cart/delete_item", { id: cartItemId }, token);
      toast.success("Item removed.");
      await loadCart();
    } catch {}
  };

  const total = cart.reduce((sum: number, item: any) => {
    const price = paymentMethod === "GC_Wallet"
      ? (parseFloat(item.item_gc_price) || parseFloat(item.item_price) || 0)
      : (parseFloat(item.discounted_price) > 0 ? parseFloat(item.discounted_price) : (parseFloat(item.item_price) || 0));
    return sum + price * (parseInt(item.item_qty) || 1);
  }, 0);

  const getItemPrice = (item: any) => {
    if (paymentMethod === "GC_Wallet") {
      return parseFloat(item.item_gc_price) || parseFloat(item.item_price) || 0;
    }
    return parseFloat(item.discounted_price) > 0 ? parseFloat(item.discounted_price) : (parseFloat(item.item_price) || 0);
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost<any>("/api/simple_checkout", {
        payment_method: paymentMethod,
        address_id: selectedAddress,
        slot_id: currentSlot?.slot_id,
        slot_owner: currentSlot?.slot_owner,
      }, token);

      if (res?.status === "error" || res?.status === "Error") {
        toast.error(res?.status_message || "Checkout failed.");
      } else {
        toast.success("Order placed successfully!");
        router.push("/member/order");
      }
    } catch (err: any) {
      toast.error(err?.message || "Checkout failed.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <Button onClick={() => router.push("/member/shopping")} className="bg-green-600 hover:bg-green-700">
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img
                    src={item.item_thumbnail ? `${apiUrl}/storage/${item.item_thumbnail}` : "/admin/img/noimage.png"}
                    alt={item.item_description || "Product"}
                    className="w-16 h-16 rounded object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/admin/img/noimage.png"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.item_description || "Product"}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.item_sku}</p>
                    <p className="text-sm text-green-700 font-bold">
                      ₱{getItemPrice(item).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, (parseInt(item.item_qty) || 1) - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.item_qty || 1}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, (parseInt(item.item_qty) || 1) + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length > 0 ? (
                <RadioGroup value={selectedAddress} onValueChange={(v) => setSelectedAddress(v)}>
                  {addresses.map((addr: any) => (
                    <div key={addr.address_id} className="flex items-center space-x-2 p-2 rounded border">
                      <RadioGroupItem value={String(addr.address_id)} id={`addr-${addr.address_id}`} />
                      <Label htmlFor={`addr-${addr.address_id}`} className="text-sm flex-1 cursor-pointer">
                        <span className="font-medium">{addr.receiver_name}</span>
                        <span className="text-muted-foreground"> — {addr.receiver_contact_number}</span>
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {[addr.additional_info, addr.barangay_city, addr.region_province, addr.address_postal_code].filter(Boolean).join(", ")}
                        </span>
                        {addr.is_default == 1 && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1 rounded">Default</span>}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No saved addresses.</p>
                  <Button variant="outline" size="sm" onClick={() => router.push("/member/settings/addresses")}>
                    Add Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                {cart.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="truncate max-w-37.5">{item.item_description || "Product"} x{item.item_qty || 1}</span>
                    <span>₱{(getItemPrice(item) * (parseInt(item.item_qty) || 1)).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-green-700">₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Wallet" id="w-php" />
                    <Label htmlFor="w-php">PHP Wallet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GC_Wallet" id="w-gc" />
                    <Label htmlFor="w-gc">GC Wallet</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleCheckout}
                disabled={submitting || !selectedAddress}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
