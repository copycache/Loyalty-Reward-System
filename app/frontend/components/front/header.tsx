"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { resolveAssetUrl } from "@/lib/api";

import { ShoppingCart, X, Trash2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const navLinks = [
  { href: "/", label: "Home", exact: true },
  { href: "/membership", label: "Become a Member" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/legalities", label: "Legalities" },
  { href: "/auth/register", label: "Register" },
];

const linkBase =
  "relative text-white/80 uppercase rounded-md px-4 py-2 text-sm transition-colors after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-amber-400 after:scale-x-0 hover:text-amber-400 hover:after:scale-x-100";
const linkActive = "text-amber-400 after:scale-x-100";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { cartItems, total, cartCount, changeQty, removeFromCart } =
    useCartStore();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  function handleNavClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 font-sans tracking-wide">
      <div className="mx-auto max-w-full px-4 sm:px-6 bg-black">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-6 min-w-0">
            {/* Hahamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0 text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
            >
              <i
                className={`fa ${mobileOpen ? "fa-times" : "fa-bars"} text-xl`}
                aria-hidden="true"
              ></i>
            </Button>

            <Link
              href="/"
              className="shrink-0 h-[50px] flex items-center justify-center"
              onClick={handleNavClick}
            >
              <Image
                src="/Landing-Page/client-resources/logo/landing-page-logo.png"
                alt="iQON ELITE Logo"
                width={200}
                height={50}
                className="h-full w-auto max-w-[200px] object-contain transition-transform duration-300 scale-[0.85]"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-1 list-none m-0 p-0">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`${linkBase} ${isActive(link.href, link.exact) ? linkActive : ""}`}
                      onClick={handleNavClick}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <Button
              variant="default"
              className="hidden sm:inline-flex rounded-full bg-amber-400 text-black font-bold hover:bg-transparent hover:text-amber-400 border border-black hover:border-amber-400"
              asChild
            >
              <Link href="/auth/login">Login</Link>
            </Button>

            {pathname !== "/product/checkout" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 text-white"
                    aria-label="Open cart"
                    data-cart-trigger
                  >
                    <ShoppingCart />
                    {cartCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>

                {/* Shopping cart */}
                <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
                  <DialogHeader className="flex-row items-center justify-between bg-red-900 px-6 py-4 space-y-0">
                    <DialogTitle className="flex items-center gap-2 text-white text-lg font-bold">
                      <ShoppingCart className="h-5 w-5" />
                      Shopping Cart
                    </DialogTitle>
                  </DialogHeader>

                  <div className="px-6 max-h-[60vh] overflow-y-auto">
                    {cartItems.length === 0 ? (
                      <div className="py-10 flex flex-col items-center gap-2 text-center text-zinc-500">
                        <ShoppingCart className="h-10 w-10 text-zinc-300" />
                        <p className="font-semibold text-zinc-900">
                          Your cart is empty!
                        </p>
                        <p className="text-sm">
                          You have no items in your shopping cart.
                          <br />
                          Let&apos;s go buy something.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {cartItems.map((item, index) => (
                          <div
                            key={item.item_id}
                            className="flex items-center gap-4 py-4"
                          >
                            {item.item_thumbnail ? (
                              <Image
                                src={resolveAssetUrl(item.item_thumbnail)}
                                alt={item.item_sku}
                                width={56}
                                height={56}
                                className="h-14 w-14 rounded-md object-cover border shrink-0"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-center text-[9px] text-center text-zinc-400 leading-tight shrink-0">
                                NO IMAGE
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm text-zinc-900 truncate">
                                  {item.item_sku}
                                </span>
                                <p className="font-semibold text-xs text-foreground/60 truncate">
                                  Color:{" "}
                                  <span className="font-semibold text-black">
                                    Blue
                                  </span>
                                </p>
                                <p className="font-semibold text-xs text-foreground/60 truncate">
                                  Size:{" "}
                                  <span className="font-semibold text-black">
                                    L
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="text-sm shrink-0 w-24 text-right">
                              {item.discounted_price &&
                              item.discounted_price !== item.item_price ? (
                                <>
                                  <span className="text-zinc-400 line-through text-xs mr-1">
                                    ₱{item.item_price.toFixed(2)}
                                  </span>
                                  <span className="text-red-500 font-semibold">
                                    ₱{item.discounted_price.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-zinc-900 font-semibold">
                                  ₱{(item.item_price ?? 0).toFixed(2)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center w-32 gap-1 shrink-0">
                              <span className="text-xs tracking-wide text-black/60 font-semibold">
                                Quantity
                              </span>
                              <Input
                                value={item.item_qty}
                                type="number"
                                min="1"
                                onChange={(e) =>
                                  changeQty(
                                    item.item_id,
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                              />
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.item_id)}
                              className="text-red-600 hover:text-red-700 shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`flex items-center justify-end gap-10 py-4 border-t ${
                        cartItems.length === 0 ? "hidden" : ""
                      }`}
                    >
                      <span className="font-bold text-zinc-900">TOTAL</span>
                      <span className="font-bold text-red-800">
                        PHP {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <DialogFooter>
                    <div className="flex items-center justify-end gap-3 border-t bg-zinc-50 px-6 py-4">
                      <DialogClose asChild>
                        <Button variant="outline">
                          <X className="h-4 w-4" />
                          Close
                        </Button>
                      </DialogClose>
                      {cartItems.length > 0 && (
                        <Button
                          className="bg-red-900 text-white hover:bg-red-800"
                          asChild
                        >
                          <Link href="/product/checkout">
                            <Check className="h-4 w-4" />
                            Checkouts
                          </Link>
                        </Button>
                      )}
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Mobile nav menu */}
        <div
          className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            mobileOpen ? "max-h-[600px]" : "max-h-0"
          }`}
        >
          <div className="pb-4 flex flex-col gap-1 border-t border-white/10 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-2.5 text-[13px] tracking-[0.08em] uppercase rounded-md text-white/80 transition-colors hover:text-amber-400 ${
                  isActive(link.href, link.exact) ? "text-amber-400" : ""
                }`}
                onClick={() => {
                  setMobileOpen(false);
                  handleNavClick();
                }}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/auth/login"
              className="px-2 py-2.5 text-[13px] tracking-[0.08em] uppercase rounded-md text-white/80 transition-colors hover:text-amber-400"
              onClick={() => {
                setMobileOpen(false);
                handleNavClick();
              }}
            >
              Login
            </Link>

            <div className="mt-2 pt-3 border-t border-white/10 text-white space-y-3">
              <p className="text-sm leading-relaxed">
                <strong className="text-base text-white">
                  +639622569301 / +639158079406
                </strong>
                <br />
                <span className="block text-xs text-zinc-400">
                  Support Hotline
                </span>
              </p>
              <p className="text-sm leading-relaxed">
                <strong className="text-base text-white">
                  iqonelitecorporation@gmail.com
                </strong>
                <br />
                <span className="block text-xs text-zinc-400">
                  Support Email
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
