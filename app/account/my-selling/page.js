"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import AccountLayout from "@/components/AccountLayout";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import ImageUploader from "@/components/ImageUploader";
import Button from "@/components/Button";
import { useToast } from "@/context/ToastContext";
import { formatRupiah, formatDate, parseRupiah } from "@/lib/format";

const USED_GRADES = ["VNDS", "Used - Good", "Used - Fair"];

function EditModal({ listing, onClose, onSaved }) {
  const { toast } = useToast();
  const used = listing.type === "USED";
  const [price, setPrice] = useState(String(listing.price));
  const [condition, setCondition] = useState(listing.condition);
  const [images, setImages] = useState(listing.image ? [listing.image] : []);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const priceNum = parseRupiah(price);
    if (priceNum < 50000) return toast("Harga minimal Rp 50.000", "error");
    if (used && images.length === 0) return toast("Barang Used wajib ada foto", "error");
    setBusy(true);
    try {
      const res = await fetch("/api/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: listing.id,
          price: priceNum,
          condition,
          image: used ? images[0] : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      toast("Listing diperbarui", "success");
      onSaved();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-card bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-ink">Edit Listing</h3>
        <p className="mt-0.5 text-sm text-muted">{listing.product.name} · EU {listing.size}</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Harga Jual</label>
            <div className="flex items-center rounded-lg border border-line bg-white px-4 focus-within:border-ink">
              <span className="text-sm font-semibold text-muted">Rp</span>
              <input
                value={price ? formatRupiah(price, { withSymbol: false }) : ""}
                onChange={(e) => setPrice(String(parseRupiah(e.target.value)))}
                inputMode="numeric"
                className="h-11 w-full bg-transparent px-2 text-sm outline-none"
              />
            </div>
          </div>

          {used && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Grade Kondisi</label>
                <div className="flex flex-wrap gap-2">
                  {USED_GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setCondition(g)}
                      className={`h-9 rounded-lg border px-3 text-sm font-semibold ${
                        condition === g ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <ImageUploader label="Foto Produk" value={images} onChange={setImages} max={1} />
            </>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button className="flex-1" onClick={save} loading={busy}>
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}

function SellingContent() {
  const { toast } = useToast();
  const [listings, setListings] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    fetch("/api/listings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .catch(() => setListings([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (l) => {
    const next = l.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await fetch("/api/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id, status: next }),
    });
    if (res.ok) {
      toast(next === "ACTIVE" ? "Listing diaktifkan" : "Listing dinonaktifkan", "success");
      load();
    } else {
      toast("Gagal mengubah status", "error");
    }
  };

  const remove = async (l) => {
    const res = await fetch("/api/listings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id }),
    });
    const data = await res.json();
    if (res.ok) {
      toast(data.softDeleted ? "Listing dinonaktifkan (ada transaksi)" : "Listing dihapus", "success");
      load();
    } else {
      toast(data.error || "Gagal menghapus", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">Penjualan Saya</h1>
          <p className="mt-1 text-sm text-muted">Kelola sneaker yang kamu jual.</p>
        </div>
        <Button href="/sell" size="sm">+ Jual</Button>
      </div>

      <div className="mt-6 space-y-4">
        {listings === null ? (
          <p className="text-sm text-muted">Memuat...</p>
        ) : listings.length === 0 ? (
          <EmptyState
            icon="🏷️"
            title="Belum ada listing"
            subtitle="Jual sneakermu dan jangkau ribuan pembeli."
            actionLabel="Jual Sneaker"
            actionHref="/sell"
          />
        ) : (
          listings.map((l) => {
            const used = l.type === "USED";
            const sold = l.status === "SOLD";
            return (
              <div key={l.id} className="rounded-card border border-line p-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className={`rounded px-1.5 py-0.5 font-bold ${used ? "bg-cloud text-muted" : "bg-mint-soft text-mint-dark"}`}>
                      {used ? "Used" : "Brand New"}
                    </span>
                    {formatDate(l.createdAt)}
                  </div>
                  <StatusBadge status={l.status} />
                </div>
                <div className="flex gap-4 pt-3">
                  <Link href={`/products/${l.product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-cloud">
                    <Image src={used && l.image ? l.image : l.product.image} alt={l.product.name} fill sizes="80px" className={used && l.image ? "object-cover" : "object-contain p-2"} />
                  </Link>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{l.product.brand?.name}</p>
                    <p className="text-sm font-semibold text-ink">{l.product.name}</p>
                    <p className="text-xs text-muted">EU {l.size} · {l.condition}</p>
                    <p className="mt-1 text-sm font-extrabold text-ink">{formatRupiah(l.price)}</p>
                  </div>
                </div>
                {!sold && (
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    <button onClick={() => setEditing(l)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-ink">
                      Edit
                    </button>
                    <button onClick={() => toggleStatus(l)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-ink">
                      {l.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button onClick={() => remove(l)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-red-500 hover:border-red-400">
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <EditModal
          listing={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

export default function MySellingPage() {
  return (
    <AccountLayout>
      <SellingContent />
    </AccountLayout>
  );
}
