"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const NAV_LINKS = [
  { label: "Marketplace", href: "/products" },
  { label: "Brand New", href: "/products?type=BNIB" },
  { label: "Used", href: "/products?type=USED" },
  { label: "Legit Check", href: "/legit-check" },
  { label: "Repair", href: "/repair" },
  { label: "Sell", href: "/sell" },
];

function IconBtn({ href, label, count, children }) {
  return (
    <Link href={href} className="relative grid place-items-center px-1 text-ink" aria-label={label}>
      {children}
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();
  const [q, setQ] = useState("");

  // Hide the marketing navbar on auth pages for a focused experience.
  if (pathname === "/login" || pathname === "/register") return null;

  const submit = (e) => {
    e.preventDefault();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/products");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      {/* Promo strip */}
      <div className="bg-ink py-1.5 text-center text-xs text-white">
        100% Authentic Guaranteed · Legit Check & Repair Service · Gratis Ongkir min. Rp 1.000.000
      </div>

      {/* Main bar */}
      <div className="container-page flex h-[68px] items-center gap-4 md:gap-6">
        <Link href="/" className="shrink-0 text-2xl font-black tracking-tight">
          Shoe<span className="text-mint-dark">Scure</span>
        </Link>

        <form onSubmit={submit} className="flex h-11 flex-1 items-center gap-2 rounded-lg bg-cloud px-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari sneaker, brand, atau model..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>

        <nav className="flex items-center gap-4">
          <IconBtn href="/wishlist" label="Wishlist" count={wishCount}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </IconBtn>
          <IconBtn href="/cart" label="Cart" count={cartCount}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
            </svg>
          </IconBtn>
          {isAuthenticated ? (
            <Link href="/account" className="grid place-items-center px-1 text-ink" aria-label="Account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink hover:bg-cloud sm:block"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
              >
                Daftar
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Category row */}
      <div className="hidden border-t border-line md:block">
        <nav className="container-page flex gap-8 py-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-semibold text-gray-600 transition-colors hover:text-mint-dark"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
