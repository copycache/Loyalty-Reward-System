"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { CartSheet } from "@/components/cart-sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", exact: true },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/member/register", label: "Register" },
];

export function FrontHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, loadCart } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 bg-white/95 backdrop-blur-sm border-b",
        scrolled && "shadow-md"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo/client-logo.png"
            alt="Domus Naturae"
            width={scrolled ? 100 : 130}
            height={scrolled ? 30 : 40}
            className="transition-all duration-300 object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(link.href, link.exact)
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          {pathname !== "/product/checkout" && (
            <CartSheet>
              <Button variant="ghost" size="icon" className="relative" data-cart-trigger>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </CartSheet>
          )}

          {/* Login Button - Desktop */}
          <Button asChild variant="default" size="sm" className="hidden lg:flex">
            <Link href="/member/login">Login</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <Image
                    src="/images/logo/client-logo.png"
                    alt="Domus Naturae"
                    width={120}
                    height={36}
                    className="object-contain"
                  />
                </div>

                <nav className="flex-1 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block px-6 py-3 text-sm font-medium transition-colors",
                        isActive(link.href, link.exact)
                          ? "text-primary bg-primary/5 border-r-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                      onClick={() => {
                        setMobileOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/member/login"
                    className="block px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                </nav>

                <div className="p-6 border-t bg-muted/50 space-y-2 text-xs text-muted-foreground">
                  <p>
                    <strong>+639622569301 / +639158079406</strong>
                    <br />
                    <span>Support Hotline</span>
                  </p>
                  <p>
                    <strong>domusnaturae.order@gmail.com</strong>
                    <br />
                    <span>Support Email</span>
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
