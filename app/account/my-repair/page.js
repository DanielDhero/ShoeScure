"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AccountLayout from "@/components/AccountLayout";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatRupiah } from "@/lib/format";

function RepairContent() {
  const [repairs, setRepairs] = useState(null);

  useEffect(() => {
    fetch("/api/repairs", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setRepairs(d.repairs || []))
      .catch(() => setRepairs([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-black text-ink">Repair Saya</h1>
      <p className="mt-1 text-sm text-muted">Riwayat permintaan repair & restorasi.</p>

      <div className="mt-6 space-y-4">
        {repairs === null ? (
          <p className="text-sm text-muted">Memuat...</p>
        ) : repairs.length === 0 ? (
          <EmptyState
            icon="🔧"
            title="Belum ada permintaan repair"
            subtitle="Bikin sneaker lamamu kembali fresh."
            actionLabel="Ajukan Repair"
            actionHref="/repair"
          />
        ) : (
          repairs.map((r) => {
            const photo = JSON.parse(r.images || "[]")[0];
            return (
              <div key={r.id} className="flex items-center justify-between rounded-card border border-line p-4">
                <div className="flex items-center gap-4">
                  {photo ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cloud">
                      <Image src={photo} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-cloud text-xl">🔧</div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.productName}</p>
                    <p className="text-xs text-muted">
                      {r.service} · <span className="font-semibold">{r.certNo}</span> · {formatDate(r.createdAt)}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-ink">{formatRupiah(r.price)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={r.status} />
                  <StatusBadge status={r.paymentStatus} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function MyRepairPage() {
  return (
    <AccountLayout>
      <RepairContent />
    </AccountLayout>
  );
}
