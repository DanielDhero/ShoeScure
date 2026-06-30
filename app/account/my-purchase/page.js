"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AccountLayout from "@/components/AccountLayout";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { formatRupiah, formatDate } from "@/lib/format";

function PurchaseContent() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-black text-ink">Pembelian Saya</h1>
      <p className="mt-1 text-sm text-muted">Riwayat semua pesananmu.</p>

      <div className="mt-6 space-y-4">
        {orders === null ? (
          <p className="text-sm text-muted">Memuat...</p>
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Belum ada pembelian"
            subtitle="Pesanan yang kamu buat akan muncul di sini."
            actionLabel="Mulai Belanja"
            actionHref="/products"
          />
        ) : (
          orders.map((o) => (
            <div key={o.id} className="rounded-card border border-line p-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="text-xs text-muted">
                  <span className="font-bold text-ink">{o.ref}</span> · {formatDate(o.createdAt)}
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex gap-4 pt-3">
                <Link
                  href={`/products/${o.product.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-cloud"
                >
                  <Image src={o.product.image} alt={o.product.name} fill sizes="80px" className="object-contain p-2" />
                </Link>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {o.product.brand?.name}
                  </p>
                  <p className="text-sm font-semibold text-ink">{o.product.name}</p>
                  <p className="text-xs text-muted">Ukuran EU {o.size}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Total</p>
                  <p className="text-sm font-extrabold text-ink">{formatRupiah(o.total)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function MyPurchasePage() {
  return (
    <AccountLayout>
      <PurchaseContent />
    </AccountLayout>
  );
}
