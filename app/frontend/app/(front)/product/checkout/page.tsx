"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle, Pencil, Trash2, Loader2 } from "lucide-react";
import Cookies from "js-cookie";

/* ---- Types ---- */
interface IslandGroup {
  id: number;
  island_group: string;
}
interface Region {
  regCode: string;
  regDesc: string;
}
interface Province {
  provCode: string;
  provDesc: string;
}
interface City {
  citymunCode: string;
  citymunDesc: string;
}
interface Barangay {
  brgyCode: string;
  brgyDesc: string;
}
interface PaymentMethod {
  name: string;
}
interface ShippingFee {
  method_charge: number;
  method_discount: number;
}

/* ---- Helpers ---- */
function capitalizeFirstLetterPerWord(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function capitalizeInsideParentheses(str: string) {
  return str.replace(/\(([^)]+)\)/g, (_, inner) => `(${inner.toUpperCase()})`);
}

/* ---- Component ---- */
export default function FrontCheckoutPage() {
  const router = useRouter();
  const { cartItems, total, loadCart, changeQty, removeFromCart, clearCart } =
    useCartStore();

  /* Form state */
  const [customer, setCustomer] = useState({
    first_name: "",
    last_name: "",
    contact: "",
    sponsor_id: "",
  });

  const [address, setAddress] = useState({
    address: "",
    island_group: "0",
    regCode: "0",
    provCode: "0",
    citymunCode: "0",
    brgyCode: "0",
    postal_code: "",
  });

  /* Location lists */
  const [islandList, setIslandList] = useState<IslandGroup[]>([]);
  const [regionList, setRegionList] = useState<Region[]>([]);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [cityList, setCityList] = useState<City[]>([]);
  const [brgyList, setBrgyList] = useState<Barangay[]>([]);

  /* Payment & shipping */
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingFee, setShippingFee] = useState<ShippingFee>({
    method_charge: 0,
    method_discount: 0,
  });
  const [useDiscount, setUseDiscount] = useState(false);

  /* UI state */
  const [submitted, setSubmitted] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [editCartOpen, setEditCartOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /* Computed */
  const discountedShippingFee =
    useDiscount && shippingFee.method_charge && shippingFee.method_discount
      ? shippingFee.method_charge - shippingFee.method_discount
      : shippingFee.method_charge;
  const grandTotal = total + discountedShippingFee;

  /* ---- Load delivery charge ---- */
  const loadDeliveryCharge = useCallback(async () => {
    try {
      const res = await apiPost<ShippingFee>(
        "/api/landing/get_delivery_charge",
        {}
      );
      setShippingFee(res);
    } catch (e) {
      console.log(e);
    }
  }, []);

  /* ---- Location loader ---- */
  const loadLocation = useCallback(
    async (
      location: string,
      code?: string
    ) => {
      if (location === "DONE") return;
      try {
        const body: Record<string, string> = { location };
        if (code) body.code = code;
        const res = await apiPost<Record<string, unknown>>(
          "/api/landing/get_location",
          body
        );

        switch (location) {
          case "ISLAND_GROUP":
            setIslandList(res as unknown as IslandGroup[]);
            break;
          case "REGION_LIST":
            setRegionList(res as unknown as Region[]);
            break;
          case "PROVINCE":
            setProvinceList(res as unknown as Province[]);
            break;
          case "CITY":
            setCityList(res as unknown as City[]);
            break;
          case "BRGY":
            setBrgyList(res as unknown as Barangay[]);
            break;
        }
      } catch (e) {
        console.log(e);
      }
    },
    []
  );

  /* ---- Init ---- */
  useEffect(() => {
    loadCart();
    loadLocation("ISLAND_GROUP");
    loadDeliveryCharge();

    // Load payment methods
    apiPost<PaymentMethod[]>("/api/landing/dropshipping_payment_method", {})
      .then(setPaymentMethods)
      .catch(console.log);

    // Read sponsor from cookie
    const sponsorId = Cookies.get("sponsor_slot_id") || "";
    setCustomer((c) => ({ ...c, sponsor_id: sponsorId }));
  }, [loadCart, loadLocation, loadDeliveryCharge]);

  /* ---- Address change handlers ---- */
  const handleIslandGroupChange = (val: string) => {
    setAddress((a) => ({
      ...a,
      island_group: val,
      regCode: "0",
      provCode: "0",
      citymunCode: "0",
      brgyCode: "0",
    }));
    setRegionList([]);
    setProvinceList([]);
    setCityList([]);
    setBrgyList([]);
    if (val !== "0") {
      loadLocation("REGION_LIST", val);
    }
  };

  const handleRegionChange = (val: string) => {
    setAddress((a) => ({
      ...a,
      regCode: val,
      provCode: "0",
      citymunCode: "0",
      brgyCode: "0",
    }));
    setProvinceList([]);
    setCityList([]);
    setBrgyList([]);
    if (val !== "0") loadLocation("PROVINCE", val);
  };

  const handleProvinceChange = (val: string) => {
    setAddress((a) => ({
      ...a,
      provCode: val,
      citymunCode: "0",
      brgyCode: "0",
    }));
    setCityList([]);
    setBrgyList([]);
    if (val !== "0") loadLocation("CITY", val);
  };

  const handleCityChange = (val: string) => {
    setAddress((a) => ({
      ...a,
      citymunCode: val,
      brgyCode: "0",
    }));
    setBrgyList([]);
    if (val !== "0") loadLocation("BRGY", val);
  };

  const handleBrgyChange = (val: string) => {
    setAddress((a) => ({ ...a, brgyCode: val }));
  };

  /* ---- Cart editing ---- */
  const handleChangeQty = (itemId: number, qty: number) => {
    if (!qty || qty < 1) {
      toast.error("The quantity must be a minimum of one.");
      changeQty(itemId, 1);
      return;
    }
    changeQty(itemId, qty);
    loadDeliveryCharge();
  };

  const handleRemoveItem = (itemId: number) => {
    if (!confirm("Are you sure?")) return;
    setDeletingId(itemId);
    setTimeout(() => {
      removeFromCart(itemId);
      setDeletingId(null);
    }, 500);
  };

  /* ---- Discount toggle ---- */
  const toggleDiscount = () => {
    setUseDiscount((d) => !d);
  };

  /* ---- Submit ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    if (!confirm("Are you sure?")) return;
    setSubmitted(true);

    try {
      const checkoutSummary = cartItems.map((item) => ({
        item_id: item.item_id,
        item_sku: item.item_sku,
        item_price: item.discounted_price || item.item_price,
        item_thumbnail: item.item_thumbnail,
        item_qty: item.item_qty,
        subtotal: item.subtotal,
      }));

      const order = {
        customer_info: customer,
        customer_address: address,
        checkout_summary: checkoutSummary,
        shipping_fee: discountedShippingFee,
        payment_method: paymentMethods[0] || { name: "COD" },
      };

      const res = await apiPost<{
        status: string;
        status_message: string | string[];
      }>("/api/landing/checkout_orders", order);

      if (res.status === "success") {
        Cookies.remove("items");
        Cookies.remove("sponsor_slot_id");
        Cookies.remove("sponsor_username");
        clearCart();
        toast.success(
          typeof res.status_message === "string"
            ? res.status_message
            : "Order placed successfully!"
        );
        setOrderSuccess(true);
      } else {
        const msgs = Array.isArray(res.status_message)
          ? res.status_message
          : [res.status_message];
        msgs.forEach((msg) => toast.error(msg));
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitted(false);
    }
  };

  /* ---- Success state ---- */
  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Order Successful</h1>
        <p className="text-muted-foreground mb-8">
          Thank you so much for your order.
        </p>
        <Button asChild size="lg">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  /* ---- Empty cart state ---- */
  if (cartItems.length === 0 && !submitted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add some products to your cart before checking out.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Loading overlay */}
      {submitted && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-semibold">Processing your order...</p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Cart Summary + Payment */}
          <div className="space-y-6">
            {/* Cart Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cart Summary</CardTitle>
                <Dialog open={editCartOpen} onOpenChange={setEditCartOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit Cart
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Cart</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                      {cartItems.map((item, idx) => (
                        <div
                          key={item.item_id}
                          className={`flex gap-3 p-3 bg-muted/50 rounded-lg transition-opacity duration-500 ${
                            deletingId === item.item_id ? "opacity-0" : ""
                          }`}
                        >
                          <span className="text-sm font-medium w-6 shrink-0">
                            {idx + 1}.
                          </span>
                          <div className="relative h-14 w-14 shrink-0 rounded overflow-hidden bg-white">
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
                            <p className="text-sm font-medium truncate">
                              {item.item_sku}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PHP{" "}
                              {(
                                item.discounted_price || item.item_price
                              ).toFixed(2)}
                            </p>
                          </div>
                          <Input
                            type="number"
                            min={1}
                            value={item.item_qty}
                            onChange={(e) =>
                              handleChangeQty(
                                item.item_id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-16 h-8 text-center text-sm"
                          />
                          <span className="text-sm font-semibold w-24 text-right">
                            PHP{" "}
                            {(
                              (item.discounted_price || item.item_price) *
                              item.item_qty
                            ).toFixed(2)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8 shrink-0"
                            onClick={() => handleRemoveItem(item.item_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.item_id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded overflow-hidden bg-zinc-100 shrink-0">
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
                      <p className="text-sm font-medium truncate">
                        {item.item_sku}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        x{item.item_qty}
                        {item.item_qty > 1 &&
                          ` (PHP ${(
                            item.discounted_price || item.item_price
                          ).toFixed(2)} each)`}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      PHP{" "}
                      {(
                        (item.discounted_price || item.item_price) *
                        item.item_qty
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethods.length > 0 ? (
                  <div className="space-y-2">
                    {paymentMethods.map((pm, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div className="h-8 w-12 bg-muted rounded flex items-center justify-center text-xs font-bold">
                          COD
                        </div>
                        <span className="text-sm font-medium">{pm.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Loading payment methods...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Order Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Order Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={customer.first_name}
                      onChange={(e) =>
                        setCustomer({ ...customer, first_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={customer.last_name}
                      onChange={(e) =>
                        setCustomer({ ...customer, last_name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input
                    value={customer.contact}
                    onChange={(e) =>
                      setCustomer({ ...customer, contact: e.target.value })
                    }
                    maxLength={11}
                    required
                  />
                </div>

                <Separator />

                {/* Shipping Address */}
                <div className="space-y-2">
                  <Label>Shipping Address</Label>
                  <Input
                    placeholder="House No., Building No., Street, Subdivision, etc.."
                    value={address.address}
                    onChange={(e) =>
                      setAddress({ ...address, address: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Island Group */}
                <div className="space-y-2">
                  <Label>Island Group</Label>
                  <Select
                    value={address.island_group}
                    onValueChange={handleIslandGroupChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Island Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Select Island Group</SelectItem>
                      {islandList.map((ig) => (
                        <SelectItem key={ig.id} value={String(ig.id)}>
                          {ig.island_group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select
                    value={address.regCode}
                    onValueChange={handleRegionChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Select Region</SelectItem>
                      {regionList.map((r) => (
                        <SelectItem key={r.regCode} value={r.regCode}>
                          {capitalizeInsideParentheses(r.regDesc)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Province */}
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Select
                    value={address.provCode}
                    onValueChange={handleProvinceChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Select Province</SelectItem>
                      {provinceList.map((p) => (
                        <SelectItem key={p.provCode} value={p.provCode}>
                          {capitalizeFirstLetterPerWord(p.provDesc)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label>City/Municipality</Label>
                  <Select
                    value={address.citymunCode}
                    onValueChange={handleCityChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Select City</SelectItem>
                      {cityList.map((c) => (
                        <SelectItem key={c.citymunCode} value={c.citymunCode}>
                          {capitalizeFirstLetterPerWord(c.citymunDesc)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Barangay */}
                <div className="space-y-2">
                  <Label>Barangay</Label>
                  <Select
                    value={address.brgyCode}
                    onValueChange={handleBrgyChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Select Barangay</SelectItem>
                      {brgyList.map((b) => (
                        <SelectItem key={b.brgyCode} value={b.brgyCode}>
                          {capitalizeFirstLetterPerWord(b.brgyDesc)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={address.postal_code}
                    onChange={(e) =>
                      setAddress({ ...address, postal_code: e.target.value })
                    }
                    maxLength={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Totals */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Items Subtotal</span>
                  <span>PHP {total.toFixed(2)}</span>
                </div>

                {shippingFee.method_charge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Shipping Fee</span>
                    <span>PHP {shippingFee.method_charge.toFixed(2)}</span>
                  </div>
                )}

                {shippingFee.method_charge > 0 &&
                  shippingFee.method_discount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useDiscount}
                          onChange={toggleDiscount}
                          className="h-4 w-4 rounded"
                        />
                        <span>Use Discount</span>
                      </label>
                      <span
                        className={
                          useDiscount ? "text-green-600" : "text-muted-foreground"
                        }
                      >
                        {useDiscount
                          ? `-PHP ${shippingFee.method_discount.toFixed(2)}`
                          : "PHP 0.00"}
                      </span>
                    </div>
                  )}

                <Separator />

                <div className="flex justify-between font-bold text-base">
                  <span>Total Amount</span>
                  <span>PHP {grandTotal.toFixed(2)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitted || cartItems.length === 0}
                >
                  {submitted ? "Processing..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
