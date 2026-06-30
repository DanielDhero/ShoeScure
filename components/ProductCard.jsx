"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";

export default function ProductCard({ product, condition }) {
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();
  const favorited = has(product.id);
  const brandName = product.brand?.name || product.brandName || "";
  const price = product.displayPrice ?? product.price;
  const href =
    condition === "BNIB" || condition === "USED"
      ? `/products/${product.slug}?cond=${condition}`
      : `/products/${product.slug}`;

  const onToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggle(product.id);
    if (res?.needsAuth) {
      toast("Login dulu untuk menyimpan ke wishlist", "error");
      router.push("/login");
      return;
    }
    toast(res.favorited ? "Ditambahkan ke wishlist" : "Dihapus dari wishlist", "success");
  };

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square bg-cloud p-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-contain p-3 transition-transform group-hover:scale-105"
        />
        {product.label && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            {product.label}
          </span>
        )}
        <button
          onClick={onToggle}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-red-300"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={favorited ? "#ef4444" : "none"}
            stroke={favorited ? "#ef4444" : "currentColor"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{brandName}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-ink">
          {product.name}
        </h3>
        {(product.hasBnib || product.hasUsed) && (
          <div className="mt-1.5 flex gap-1">
            {product.hasBnib && (
              <span className="rounded bg-mint-soft px-1.5 py-0.5 text-[10px] font-bold text-mint-dark">
                New
              </span>
            )}
            {product.hasUsed && (
              <span className="rounded bg-cloud px-1.5 py-0.5 text-[10px] font-bold text-muted">Used</span>
            )}
          </div>
        )}
        <p className="mt-2 text-[11px] text-muted">{product.hasListing === false ? "Belum ada penjual" : "Lowest Ask"}</p>
        <p className="text-base font-extrabold text-ink">{formatRupiah(price)}</p>
      </div>
    </Link>
  );
}
