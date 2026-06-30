"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { formatRupiah } from "@/lib/format";

function SuccessContent() {
  const params = useSearchParams();
  const ref = params.get("ref") || "—";
  const total = params.get("total");
  const pending = params.get("status") === "pending";

  return (
    <div className="container-page grid place-items-center py-20">
      <div className="w-full max-w-md text-center">
        <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${pending ? "bg-amber-100" : "bg-mint-soft"}`}>
          {pending ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="3">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1fb97e" strokeWidth="3">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </div>
        <h1 className="mt-6 text-2xl font-black text-ink">
          {pending ? "Menunggu Pembayaran" : "Pembayaran Berhasil!"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {pending
            ? "Selesaikan pembayaranmu sesuai instruksi. Status akan diperbarui otomatis setelah lunas."
            : "Terima kasih telah berbelanja di ShoeScure. Pesananmu sedang kami proses."}
        </p>

        <div className="mt-6 rounded-card border border-line p-5 text-left">
          <div className="flex justify-between border-b border-line pb-3 text-sm">
            <span className="text-muted">No. Invoice</span>
            <span className="font-bold text-ink">{ref}</span>
          </div>
          {total && (
            <div className="flex justify-between pt-3 text-sm">
              <span className="text-muted">Total Dibayar</span>
              <span className="font-bold text-ink">{formatRupiah(total)}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href="/account/my-purchase" size="lg" className="flex-1">
            Lihat Pesanan
          </Button>
          <Button href="/products" variant="outline" size="lg" className="flex-1">
            Lanjut Belanja
          </Button>
        </div>

        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-muted hover:text-ink">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
