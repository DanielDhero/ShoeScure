"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { formatRupiah, parseRupiah } from "@/lib/format";
import Button from "./Button";

export default function ProductMarketActions({ product, bnib, used, initialCond }) {
  const router = useRouter();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();

  const startCond = initialCond === "USED" && used.available ? "USED" : initialCond === "BNIB" ? "BNIB" : bnib.available ? "BNIB" : used.available ? "USED" : "BNIB";
  const [cond, setCond] = useState(startCond);
  const [size, setSize] = useState(null);
  const [busy, setBusy] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const favorited = has(product.id);

  const active = cond === "USED" ? used : bnib;
  const sel = size != null ? active.bySize[size] : null;

  const pickCond = (c) => {
    setCond(c);
    setSize(null);
  };

  const ensureSel = () => {
    if (!sel) {
      toast("Pilih ukuran yang tersedia", "error");
      return false;
    }
    return true;
  };

  const buyNow = () => {
    if (!ensureSel()) return;
    router.push(`/checkout?listing=${sel.id}`);
  };

  const addToCart = async () => {
    if (!ensureSel()) return;
    setBusy(true);
    const res = await add(sel.id);
    setBusy(false);
    if (res?.needsAuth) {
      toast("Login dulu untuk menambah ke keranjang", "error");
      router.push("/login");
      return;
    }
    if (!res?.ok) {
      toast(res?.error || "Gagal menambah ke keranjang", "error");
      return;
    }
    toast("Ditambahkan ke keranjang", "success");
  };

  const onWishlist = async () => {
    const res = await toggle(product.id);
    if (res?.needsAuth) {
      toast("Login dulu untuk menyimpan ke wishlist", "error");
      router.push("/login");
      return;
    }
    toast(res.favorited ? "Ditambahkan ke wishlist" : "Dihapus dari wishlist", "success");
  };

  const submitBid = async () => {
    if (!size) return toast("Pilih ukuran dulu untuk menawar", "error");
    const amount = parseRupiah(bidAmount);
    if (amount < 50000) return toast("Tawaran minimal Rp 50.000", "error");
    setBusy(true);
    const res = await fetch("/api/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, size, type: cond, amount }),
    });
    setBusy(false);
    if (res.status === 401) {
      toast("Login dulu untuk menawar", "error");
      router.push("/login");
      return;
    }
    const data = await res.json();
    if (!res.ok) return toast(data.error || "Gagal menawar", "error");
    toast("Tawaran terkirim! Cek status di Akun → Tawaran.", "success");
    setBidOpen(false);
    setBidAmount("");
  };

  const TabBtn = ({ value, label, avail }) => (
    <button
      onClick={() => pickCond(value)}
      className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${
        cond === value ? "border-ink bg-cloud" : "border-line hover:border-ink"
      }`}
    >
      <span className="block text-sm font-bold text-ink">{label}</span>
      <span className="block text-xs text-muted">
        {avail.available ? `Mulai ${formatRupiah(avail.lowest)}` : "Belum ada penjual"}
      </span>
    </button>
  );

  return (
    <div>
      {/* Condition toggle */}
      <div className="mt-5 flex gap-3">
        <TabBtn value="BNIB" label="Brand New" avail={bnib} />
        <TabBtn value="USED" label="Used" avail={used} />
      </div>

      {/* Price box */}
      <div className="mt-4 rounded-card border border-line bg-cloud p-4">
        <p className="text-xs text-muted">{sel ? "Harga" : "Mulai dari"}</p>
        <p className="text-3xl font-black text-ink">
          {sel ? formatRupiah(sel.price) : active.available ? formatRupiah(active.lowest) : "—"}
        </p>
        {sel && <p className="mt-0.5 text-xs text-muted">Kondisi: {sel.condition} · Penjual {sel.user?.name}</p>}
      </div>

      {/* Size grid */}
      {active.available ? (
        <>
          <div className="mb-2 mt-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Pilih Ukuran (EU)</p>
            <button onClick={onWishlist} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill={favorited ? "#ef4444" : "none"} stroke={favorited ? "#ef4444" : "currentColor"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {favorited ? "Tersimpan" : "Wishlist"}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {product.sizeList.map((s) => {
              const listing = active.bySize[s];
              const selected = size === s;
              return (
                <button
                  key={s}
                  disabled={!listing}
                  onClick={() => setSize(s)}
                  className={`flex flex-col items-center rounded-lg border px-2 py-2 text-sm transition-colors ${
                    selected
                      ? "border-ink bg-ink text-white"
                      : listing
                      ? "border-line bg-white text-ink hover:border-ink"
                      : "cursor-not-allowed border-line bg-cloud text-gray-300"
                  }`}
                >
                  <span className="font-semibold">EU {s}</span>
                  <span className={`text-[10px] ${selected ? "text-white/80" : "text-muted"}`}>
                    {listing ? formatRupiah(listing.price, { withSymbol: false }) : "—"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Used: seller photo */}
          {cond === "USED" && sel?.image && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-ink">Foto Asli dari Penjual</p>
              <div className="relative aspect-square w-40 overflow-hidden rounded-lg border border-line bg-cloud">
                <Image src={sel.image} alt="Foto barang" fill sizes="160px" className="object-cover" />
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button variant="primary" size="lg" className="flex-1" onClick={buyNow}>
              Beli Sekarang
            </Button>
            <Button variant="mint" size="lg" className="flex-1" onClick={addToCart} loading={busy}>
              + Keranjang
            </Button>
          </div>
          <Button variant="outline" size="lg" className="mt-3 w-full" onClick={() => setBidOpen(true)}>
            Tawar Harga
          </Button>

          {/* Bid modal */}
          {bidOpen && (
            <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" onClick={() => setBidOpen(false)}>
              <div className="w-full max-w-sm rounded-card bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-ink">Tawar Harga</h3>
                <p className="mt-0.5 text-sm text-muted">
                  {product.name} · {cond === "USED" ? "Used" : "Brand New"} {size ? `· EU ${size}` : ""}
                </p>
                {sel && <p className="mt-2 text-sm text-muted">Lowest ask saat ini: <span className="font-bold text-ink">{formatRupiah(sel.price)}</span></p>}
                <div className="mt-4 flex items-center rounded-lg border border-line bg-white px-4 focus-within:border-ink">
                  <span className="text-sm font-semibold text-muted">Rp</span>
                  <input
                    autoFocus
                    value={bidAmount ? formatRupiah(bidAmount, { withSymbol: false }) : ""}
                    onChange={(e) => setBidAmount(String(parseRupiah(e.target.value)))}
                    placeholder="Masukkan tawaranmu"
                    inputMode="numeric"
                    className="h-12 w-full bg-transparent px-2 text-sm outline-none"
                  />
                </div>
                <div className="mt-5 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setBidOpen(false)}>Batal</Button>
                  <Button className="flex-1" onClick={submitBid} loading={busy}>Kirim Tawaran</Button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-line bg-cloud/50 p-6 text-center">
          <p className="text-sm font-semibold text-ink">Belum ada yang menjual kondisi ini.</p>
          <p className="mt-1 text-sm text-muted">Jadilah penjual pertama untuk produk ini.</p>
          <Button href={`/sell?product=${product.slug}`} variant="outline" className="mt-4">
            Jual Punyamu
          </Button>
        </div>
      )}

      <Button href={`/sell?product=${product.slug}`} variant="ghost" size="sm" className="mt-3 w-full">
        Punya barang ini? Jual di ShoeScure →
      </Button>
    </div>
  );
}
