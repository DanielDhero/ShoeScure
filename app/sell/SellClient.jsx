"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import ImageUploader from "@/components/ImageUploader";
import { useToast } from "@/context/ToastContext";
import { formatRupiah, parseRupiah } from "@/lib/format";
import { SELL_ADMIN_FEE } from "@/lib/constants";

const USED_GRADES = ["VNDS", "Used - Good", "Used - Fair"];

export default function SellClient({ catalog, preselectSlug }) {
  const router = useRouter();
  const { toast } = useToast();

  const preselected = catalog.find((c) => c.slug === preselectSlug) || null;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(preselected);
  const [type, setType] = useState("BNIB"); // BNIB | USED
  const [grade, setGrade] = useState("Used - Good");
  const [size, setSize] = useState(null);
  const [price, setPrice] = useState(preselected ? String(preselected.price) : "");
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return catalog
      .filter((c) => c.name.toLowerCase().includes(q) || c.brand?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, catalog]);

  const priceNum = parseRupiah(price);
  const payout = Math.max(0, priceNum - SELL_ADMIN_FEE);

  const pickProduct = (p) => {
    setSelected(p);
    setSize(null);
    setPrice(String(p.price));
    setQuery("");
  };

  const submit = async () => {
    if (!selected) return toast("Pilih produk terlebih dahulu", "error");
    if (!size) return toast("Pilih ukuran", "error");
    if (priceNum < 50000) return toast("Harga minimal Rp 50.000", "error");
    if (type === "USED" && images.length === 0) return toast("Wajib upload foto untuk barang Used", "error");
    setBusy(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selected.id,
          size,
          price: priceNum,
          type,
          condition: type === "USED" ? grade : "Brand New",
          image: images[0] || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat listing");
      toast("Listing berhasil dibuat!", "success");
      router.push("/account/my-selling");
    } catch (err) {
      toast(err.message, "error");
      setBusy(false);
    }
  };

  const typeBtn = (value, label, sub) => (
    <button
      type="button"
      onClick={() => setType(value)}
      className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${
        type === value ? "border-ink bg-cloud" : "border-line hover:border-ink"
      }`}
    >
      <span className="block text-sm font-bold text-ink">{label}</span>
      <span className="block text-xs text-muted">{sub}</span>
    </button>
  );

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-black text-ink">Jual Sneaker</h1>
      <p className="mt-1 text-sm text-muted">
        Pasang sneakermu di marketplace ShoeScure dan jangkau ribuan pembeli.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Step 1: product */}
          <section className="rounded-card border border-line p-5">
            <h2 className="text-base font-bold text-ink">1. Pilih Produk</h2>
            {selected ? (
              <div className="mt-4 flex items-center gap-4 rounded-lg border border-line bg-cloud p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image src={selected.image} alt={selected.name} fill sizes="64px" className="object-contain p-1.5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{selected.brand}</p>
                  <p className="text-sm font-semibold text-ink">{selected.name}</p>
                  <p className="text-xs text-muted">Lowest Ask {formatRupiah(selected.price)}</p>
                </div>
                <button onClick={() => { setSelected(null); setSize(null); }} className="text-xs font-semibold text-red-500 hover:underline">
                  Ganti
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama sneaker atau brand..."
                  className="h-11 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
                />
                {results.length > 0 && (
                  <div className="mt-2 divide-y divide-line rounded-lg border border-line">
                    {results.map((p) => (
                      <button key={p.id} onClick={() => pickProduct(p)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-cloud">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-cloud">
                          <Image src={p.image} alt={p.name} fill sizes="48px" className="object-contain p-1" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-ink">{p.name}</p>
                          <p className="text-xs text-muted">{p.brand}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {query.trim() && results.length === 0 && <p className="mt-2 text-sm text-muted">Produk tidak ditemukan.</p>}
              </div>
            )}
          </section>

          {/* Step 2: condition */}
          <section className={`rounded-card border border-line p-5 ${!selected ? "opacity-50" : ""}`}>
            <h2 className="text-base font-bold text-ink">2. Kondisi Barang</h2>
            <div className="mt-4 flex gap-3">
              {typeBtn("BNIB", "Brand New", "Baru, belum dipakai")}
              {typeBtn("USED", "Used", "Bekas pakai (wajib foto)")}
            </div>

            {type === "USED" && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">Grade Kondisi</p>
                  <div className="flex flex-wrap gap-2">
                    {USED_GRADES.map((g) => (
                      <button
                        key={g}
                        type="button"
                        disabled={!selected}
                        onClick={() => setGrade(g)}
                        className={`h-10 rounded-lg border px-4 text-sm font-semibold transition-colors ${
                          grade === g ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo upload — required for used */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">
                    Foto Asli Produk <span className="text-red-500">*</span>
                  </p>
                  <ImageUploader value={images} onChange={setImages} max={1} />
                </div>
              </div>
            )}
          </section>

          {/* Step 3: size & price */}
          <section className={`rounded-card border border-line p-5 ${!selected ? "opacity-50" : ""}`}>
            <h2 className="text-base font-bold text-ink">3. Ukuran & Harga</h2>
            <p className="mb-2 mt-4 text-sm font-semibold text-ink">Ukuran (EU)</p>
            <div className="flex flex-wrap gap-2">
              {(selected?.sizes || []).map((s) => (
                <button
                  key={s}
                  disabled={!selected}
                  onClick={() => setSize(s)}
                  className={`h-11 min-w-14 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                    size === s ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mb-2 mt-5 text-sm font-semibold text-ink">Harga Jual</p>
            <div className="flex items-center rounded-lg border border-line bg-white px-4 focus-within:border-ink">
              <span className="text-sm font-semibold text-muted">Rp</span>
              <input
                disabled={!selected}
                value={price ? formatRupiah(price, { withSymbol: false }) : ""}
                onChange={(e) => setPrice(String(parseRupiah(e.target.value)))}
                placeholder="0"
                inputMode="numeric"
                className="h-12 w-full bg-transparent px-2 text-sm outline-none"
              />
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-card border border-line p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-ink">Estimasi Pendapatan</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Kondisi</span>
              <span className="font-semibold text-ink">{type === "USED" ? grade : "Brand New"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Harga jual</span>
              <span className="font-semibold text-ink">{formatRupiah(priceNum)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Biaya admin</span>
              <span className="font-semibold text-red-500">− {formatRupiah(SELL_ADMIN_FEE)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-bold text-ink">Kamu terima</span>
            <span className="text-lg font-black text-mint-dark">{formatRupiah(payout)}</span>
          </div>
          <Button size="lg" className="mt-5 w-full" onClick={submit} loading={busy} disabled={!selected}>
            Pasang Listing
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted">
            Produk akan diverifikasi tim ShoeScure sebelum tayang.
          </p>
        </aside>
      </div>
    </div>
  );
}
