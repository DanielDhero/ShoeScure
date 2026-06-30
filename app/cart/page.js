"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/format";
import { SHIPPING_FEE } from "@/lib/constants";

function CartRow({ item, onRemove }) {
  const { product, listing } = item;
  const used = listing?.type === "USED";
  return (
    <div className="flex gap-4 border-b border-line py-4">
      <Link
        href={`/products/${product.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-cloud"
      >
        <Image
          src={used && listing?.image ? listing.image : product.image}
          alt={product.name}
          fill
          sizes="96px"
          className={used && listing?.image ? "object-cover" : "object-contain p-2"}
        />
      </Link>

      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {product.brand?.name}
        </p>
        <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-ink hover:underline">
          {product.name}
        </Link>
        <p className="mt-0.5 text-xs text-muted">
          Ukuran EU {item.size} · {listing?.condition}
        </p>
        <span className={`mt-1 w-fit rounded px-1.5 py-0.5 text-[10px] font-bold ${used ? "bg-cloud text-muted" : "bg-mint-soft text-mint-dark"}`}>
          {used ? "Used" : "Brand New"}
        </span>

        <div className="mt-auto pt-2">
          <button onClick={() => onRemove(item.id)} className="text-xs font-semibold text-red-500 hover:underline">
            Hapus
          </button>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-extrabold text-ink">{formatRupiah(listing?.price ?? 0)}</p>
      </div>
    </div>
  );
}

function CartContent() {
  const router = useRouter();
  const { items, subtotal, count, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-page py-8">
        <h1 className="mb-6 text-2xl font-black text-ink">Keranjang</h1>
        <EmptyState
          icon="🛒"
          title="Keranjang masih kosong"
          subtitle="Tambahkan sneaker ke keranjang untuk melanjutkan ke pembayaran."
          actionLabel="Mulai Belanja"
          actionHref="/products"
        />
      </div>
    );
  }

  const total = subtotal + SHIPPING_FEE;

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-black text-ink">Keranjang</h1>
      <p className="mt-1 text-sm text-muted">{count} item</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {items.map((item) => (
            <CartRow key={item.id} item={item} onRemove={remove} />
          ))}
        </div>

        <aside className="h-fit rounded-card border border-line p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-ink">Ringkasan Belanja</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal ({count} item)</span>
              <span className="font-semibold text-ink">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Ongkos kirim</span>
              <span className="font-semibold text-ink">{formatRupiah(SHIPPING_FEE)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-bold text-ink">Total</span>
            <span className="text-lg font-black text-ink">{formatRupiah(total)}</span>
          </div>
          <Button size="lg" className="mt-5 w-full" onClick={() => router.push("/checkout?source=cart")}>
            Checkout
          </Button>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm font-semibold text-muted hover:text-ink"
          >
            Lanjut belanja
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <AuthGate>
      <CartContent />
    </AuthGate>
  );
}
