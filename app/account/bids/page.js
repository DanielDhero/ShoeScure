"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AccountLayout from "@/components/AccountLayout";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import { useToast } from "@/context/ToastContext";
import { formatRupiah, formatDate, parseRupiah } from "@/lib/format";

function BidRow({ bid, children }) {
  const used = bid.type === "USED";
  return (
    <div className="rounded-card border border-line p-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <span className="text-xs text-muted">{formatDate(bid.createdAt)}</span>
        <StatusBadge status={bid.status} />
      </div>
      <div className="flex gap-4 pt-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-cloud">
          <Image src={bid.product.image} alt={bid.product.name} fill sizes="64px" className="object-contain p-1.5" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{bid.product.brand?.name}</p>
          <p className="text-sm font-semibold text-ink">{bid.product.name}</p>
          <p className="text-xs text-muted">EU {bid.size} · {used ? "Used" : "Brand New"}{bid.user ? ` · oleh ${bid.user.name}` : ""}</p>
          <p className="mt-1 text-sm font-extrabold text-ink">{formatRupiah(bid.amount)}</p>
        </div>
      </div>
      {children && <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">{children}</div>}
    </div>
  );
}

function SellerBidCard({ bid, onAction }) {
  const [counter, setCounter] = useState(false);
  const [amount, setAmount] = useState("");
  return (
    <BidRow bid={bid}>
      {!counter ? (
        <>
          <button onClick={() => onAction(bid.id, "accept")} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-black">
            Terima
          </button>
          <button onClick={() => onAction(bid.id, "reject")} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-red-500 hover:border-red-400">
            Tolak
          </button>
          <button onClick={() => setCounter(true)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-ink">
            Counter
          </button>
        </>
      ) : (
        <div className="flex w-full items-center gap-2">
          <div className="flex flex-1 items-center rounded-lg border border-line px-3">
            <span className="text-xs font-semibold text-muted">Rp</span>
            <input
              autoFocus
              value={amount ? formatRupiah(amount, { withSymbol: false }) : ""}
              onChange={(e) => setAmount(String(parseRupiah(e.target.value)))}
              inputMode="numeric"
              placeholder="Harga counter"
              className="h-9 w-full bg-transparent px-2 text-xs outline-none"
            />
          </div>
          <button onClick={() => onAction(bid.id, "counter", parseRupiah(amount))} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white">
            Kirim
          </button>
          <button onClick={() => setCounter(false)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink">
            Batal
          </button>
        </div>
      )}
    </BidRow>
  );
}

function BidsContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState("mine");
  const [mine, setMine] = useState(null);
  const [incoming, setIncoming] = useState(null);

  const load = useCallback(() => {
    fetch("/api/bids", { cache: "no-store" }).then((r) => r.json()).then((d) => setMine(d.bids || [])).catch(() => setMine([]));
    fetch("/api/bids?role=seller", { cache: "no-store" }).then((r) => r.json()).then((d) => setIncoming(d.bids || [])).catch(() => setIncoming([]));
  }, []);

  useEffect(() => { load(); }, [load]);

  const sellerAction = async (id, action, counterAmount) => {
    if (action === "counter" && (!counterAmount || counterAmount < 50000)) return toast("Counter minimal Rp 50.000", "error");
    const res = await fetch("/api/bids", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, counterAmount }),
    });
    const data = await res.json();
    if (!res.ok) return toast(data.error || "Gagal", "error");
    toast(action === "accept" ? "Tawaran diterima" : action === "reject" ? "Tawaran ditolak" : "Counter terkirim", "success");
    load();
  };

  const cancelBid = async (id) => {
    const res = await fetch("/api/bids", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "cancel" }),
    });
    if (res.ok) { toast("Tawaran dibatalkan", "success"); load(); }
  };

  const tabBtn = (key, label, count) => (
    <button
      onClick={() => setTab(key)}
      className={`rounded-full border px-4 py-2 text-sm font-semibold ${tab === key ? "border-ink bg-ink text-white" : "border-line text-gray-600 hover:border-ink"}`}
    >
      {label}{count != null && count > 0 ? ` (${count})` : ""}
    </button>
  );

  return (
    <div>
      <h1 className="text-2xl font-black text-ink">Tawaran</h1>
      <p className="mt-1 text-sm text-muted">Kelola penawaran harga (bid) jual-beli.</p>

      <div className="mt-5 flex gap-2">
        {tabBtn("mine", "Tawaran Saya", mine?.length)}
        {tabBtn("incoming", "Tawaran Masuk", incoming?.length)}
      </div>

      <div className="mt-5 space-y-4">
        {tab === "mine" ? (
          mine === null ? (
            <p className="text-sm text-muted">Memuat...</p>
          ) : mine.length === 0 ? (
            <EmptyState icon="🤝" title="Belum ada tawaran" subtitle="Tawar harga sneaker incaranmu dari halaman produk." actionLabel="Jelajahi" actionHref="/products" />
          ) : (
            mine.map((b) => (
              <BidRow key={b.id} bid={b}>
                {["ACCEPTED", "COUNTERED"].includes(b.status) && (
                  <Button size="sm" onClick={() => router.push(`/checkout?bid=${b.id}`)}>
                    Bayar {formatRupiah(b.amount)}
                  </Button>
                )}
                {["PENDING", "COUNTERED"].includes(b.status) && (
                  <button onClick={() => cancelBid(b.id)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-red-500 hover:border-red-400">
                    Batalkan
                  </button>
                )}
              </BidRow>
            ))
          )
        ) : incoming === null ? (
          <p className="text-sm text-muted">Memuat...</p>
        ) : incoming.length === 0 ? (
          <EmptyState icon="📥" title="Belum ada tawaran masuk" subtitle="Tawaran untuk listing aktifmu akan muncul di sini." actionLabel="Lihat Penjualan" actionHref="/account/my-selling" />
        ) : (
          incoming.map((b) => <SellerBidCard key={b.id} bid={b} onAction={sellerAction} />)
        )}
      </div>
    </div>
  );
}

export default function BidsPage() {
  return (
    <AccountLayout>
      <BidsContent />
    </AccountLayout>
  );
}
