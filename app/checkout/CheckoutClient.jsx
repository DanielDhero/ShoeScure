"use client";

import { useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatRupiah } from "@/lib/format";

export default function CheckoutClient({
  mode,
  lineItems,
  subtotal,
  shipping,
  single,
  user,
  snapScriptUrl,
  snapClientKey,
  paymentReady,
}) {
  const router = useRouter();
  const { refresh: refreshCart } = useCart();
  const { toast } = useToast();
  const [address, setAddress] = useState(user.address);
  const [phone, setPhone] = useState(user.phone);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const total = subtotal + shipping;

  // After the Snap popup resolves, confirm the real status with our backend
  // (this works even on localhost where Midtrans can't reach the webhook).
  const finish = async (ref, kind) => {
    try {
      await fetch("/api/payment/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      });
    } catch {
      /* webhook will reconcile later */
    }
    if (mode === "cart") await refreshCart();
    router.push(`/payment-success?ref=${ref}&total=${total}&status=${kind}`);
  };

  const openSnap = (token, ref) => {
    if (typeof window === "undefined" || !window.snap) {
      toast("Gagal memuat pembayaran. Refresh halaman lalu coba lagi.", "error");
      setBusy(false);
      return;
    }
    window.snap.pay(token, {
      onSuccess: () => finish(ref, "success"),
      onPending: () => finish(ref, "pending"),
      onError: () => {
        toast("Pembayaran gagal. Coba lagi.", "error");
        setBusy(false);
      },
      onClose: () => {
        toast("Pembayaran dibatalkan.", "error");
        setBusy(false);
      },
    });
  };

  const pay = async () => {
    if (!paymentReady) {
      toast("Payment gateway belum dikonfigurasi (cek .env).", "error");
      return;
    }
    if (!address.trim() || !phone.trim()) {
      toast("Lengkapi alamat dan nomor telepon", "error");
      return;
    }
    setBusy(true);
    const body = mode === "cart" ? { fromCart: true, note } : { ...single, note };
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout gagal");
      openSnap(data.token, data.ref);
    } catch (err) {
      toast(err.message, "error");
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-8">
      {paymentReady && (
        <Script src={snapScriptUrl} data-client-key={snapClientKey} strategy="afterInteractive" />
      )}

      <h1 className="text-2xl font-black text-ink">Checkout</h1>

      {!paymentReady && (
        <div className="mt-4 rounded-card border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <span className="font-bold">Payment gateway belum aktif.</span> Set{" "}
          <code className="rounded bg-amber-100 px-1">MIDTRANS_SERVER_KEY</code> &{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_MIDTRANS_CLIENT_KEY</code> di{" "}
          <code className="rounded bg-amber-100 px-1">.env</code> lalu restart server.
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Shipping info */}
          <section className="rounded-card border border-line p-5">
            <h2 className="text-base font-bold text-ink">Alamat Pengiriman</h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Penerima</label>
                  <input
                    value={user.name}
                    disabled
                    className="h-11 w-full rounded-lg border border-line bg-cloud px-4 text-sm text-muted"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">No. Telepon</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="h-11 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Alamat lengkap</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="Jalan, nomor rumah, kelurahan, kota, kode pos"
                  className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Catatan (opsional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Patokan, instruksi kurir, dll."
                  className="h-11 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
                />
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="rounded-card border border-line p-5">
            <h2 className="text-base font-bold text-ink">Produk ({lineItems.length})</h2>
            <div className="mt-4 divide-y divide-line">
              {lineItems.map((li) => (
                <div key={li.key} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-cloud">
                    <Image src={li.image} alt={li.name} fill sizes="64px" className="object-contain p-1.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{li.brand}</p>
                    <p className="text-sm font-semibold text-ink">{li.name}</p>
                    <p className="text-xs text-muted">EU {li.size} · {li.quantity}x</p>
                  </div>
                  <p className="text-sm font-bold text-ink">{formatRupiah(li.price * li.quantity)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Payment methods info */}
          <section className="rounded-card border border-line p-5">
            <h2 className="text-base font-bold text-ink">Metode Pembayaran</h2>
            <p className="mt-2 text-sm text-muted">
              Pilih metode (Virtual Account, QRIS, GoPay, kartu, dll.) di jendela pembayaran
              aman setelah menekan tombol di bawah.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted">
              {["BCA VA", "BNI VA", "QRIS", "GoPay", "ShopeePay", "Kartu Kredit"].map((m) => (
                <span key={m} className="rounded-full border border-line bg-cloud px-3 py-1">{m}</span>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-card border border-line p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-ink">Ringkasan Pesanan</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold text-ink">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Ongkos kirim</span>
              <span className="font-semibold text-ink">{formatRupiah(shipping)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-bold text-ink">Total Bayar</span>
            <span className="text-lg font-black text-ink">{formatRupiah(total)}</span>
          </div>
          <Button size="lg" className="mt-5 w-full" onClick={pay} loading={busy} disabled={!paymentReady}>
            Bayar Sekarang
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted">
            Pembayaran diproses aman oleh Midtrans · 100% authentic guaranteed
          </p>
        </aside>
      </div>
    </div>
  );
}
