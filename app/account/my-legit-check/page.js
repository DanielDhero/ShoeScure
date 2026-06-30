"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AccountLayout from "@/components/AccountLayout";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

function LegitCheckContent() {
  const [checks, setChecks] = useState(null);

  useEffect(() => {
    fetch("/api/legit-checks", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setChecks(d.checks || []))
      .catch(() => setChecks([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-black text-ink">Legit Check Saya</h1>
      <p className="mt-1 text-sm text-muted">Riwayat pengecekan keaslian sneaker.</p>

      <div className="mt-6 space-y-4">
        {checks === null ? (
          <p className="text-sm text-muted">Memuat...</p>
        ) : checks.length === 0 ? (
          <EmptyState
            icon="📜"
            title="Belum ada legit check"
            subtitle="Verifikasi keaslian sneakermu dengan 1 coin."
            actionLabel="Mulai Legit Check"
            actionHref="/legit-check"
          />
        ) : (
          checks.map((c) => {
            const photo = JSON.parse(c.images || "[]")[0];
            return (
              <div key={c.id} className="flex items-center justify-between rounded-card border border-line p-4">
                <div className="flex items-center gap-4">
                  {photo ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cloud">
                      <Image src={photo} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-cloud text-xl">📜</div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-ink">{c.brand} {c.productName}</p>
                    <p className="text-xs text-muted">
                      <span className="font-semibold">{c.certNo}</span> · {formatDate(c.createdAt)} · {c.payMethod === "CASH" ? "Bayar uang" : "Bayar coin"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={c.status} />
                  <StatusBadge status={c.paymentStatus} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function MyLegitCheckPage() {
  return (
    <AccountLayout>
      <LegitCheckContent />
    </AccountLayout>
  );
}
