"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube } from "lucide-react";

const menuLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Shop" },
  { href: "/membership", label: "Be a Member" },
  { href: "/contact", label: "Contact Us" },
  { href: "/legalities", label: "Legalities" },
];

const policyLinks = [
  { href: "#", label: "FAQ" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "#", label: "Shipping & Returns" },
];

const socials = [
  { href: "https://facebook.com/iqonelitecorporation", label: "Facebook", Icon: Facebook },
  { href: "https://www.instagram.com/iqonelite/", label: "Instagram", Icon: Instagram },
  { href: "https://www.youtube.com/@iQONELITECorporation", label: "YouTube", Icon: Youtube },
];

export function FrontFooter() {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="bg-black text-white font-sans">
      <div className="mx-auto px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] gap-x-8 gap-y-12 pb-12 border-b border-white/10">
          <div>
            <Image
              src="/Landing-Page/client-resources/logo/client-logo.png"
              alt="iQON ELITE"
              width={170}
              height={51}
              className="w-[150px] h-auto mb-5"
            />

            <div className="flex gap-3 mt-6">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-amber-400 hover:text-amber-400"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer menu">
            <h3 className="text-xs tracking-[0.14em] uppercase text-amber-400/90 font-semibold mb-5">
              Menu
            </h3>
            <ul className="list-none p-0 space-y-3">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={scrollToTop}
                    className="text-sm text-white/60 no-underline transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer policies">
            <h3 className="text-xs tracking-[0.14em] uppercase text-amber-400/90 font-semibold mb-5">
              Policies
            </h3>
            <ul className="list-none p-0 space-y-3">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={scrollToTop}
                    className="text-sm text-white/60 no-underline transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs tracking-[0.14em] uppercase text-amber-400/90 font-semibold mb-5">
              Contact
            </h3>
            <ul className="list-none p-0 space-y-3 text-sm text-white/60">
              <li>
                <a href="tel:+639977110055" className="hover:text-white transition-colors">
                  +63 997 711 0055
                </a>
              </li>
              <li>Baguio City, Benguet</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-white/40">
          <p className="m-0">© 2025 iQON Elite Corporation. All rights reserved.</p>
          <p className="m-0 tracking-[0.1em] uppercase text-white/30">Baguio City · Philippines</p>
        </div>
      </div>
    </footer>
  );
}