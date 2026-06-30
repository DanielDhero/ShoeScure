"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import Button from "@/components/Button";
import ImageUploader from "@/components/ImageUploader";
import { useToast } from "@/context/ToastContext";
import { useSnapPay, snapConfigured } from "@/components/useSnapPay";
import { REPAIR_SERVICES, SERVICE_BUNDLES } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";

function RepairContent() {
  const router = useRouter();
  const { toast } = useToast();
  const pay = useSnapPay();

  const [mode, setMode] = useState("satuan"); // satuan | paket
  const [picked, setPicked] = useState([]); // service ids
  const [bundle, setBundle] = useState(null);
  const [productName, setProductName] = useState("");
  const [images, setImages] = useState([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const total =
    mode === "paket"
      ? bundle?.price ?? 0
      : REPAIR_SERVICES.filter((s) => picked.includes(s.id)).reduce((sum, s) => sum + s.price, 0);

  const toggleService = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const finish = async (ref) => {
    try {
      await fetch("/api/payment/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      });
    } catch { /* webhook reconciles */ }
    router.push(`/payment-success?ref=${ref}&total=${total}&status=success`);
  };

  const submit = async () => {
    if (mode === "satuan" && picked.length === 0) return toast("Pilih minimal satu layanan", "error");
    if (mode === "paket" && !bundle) return toast("Pilih paket layanan", "error");
    if (!productName.trim()) return toast("Isi nama/model sepatu", "error");
    if (images.length === 0) return toast("Wajib upload foto sepatu", "error");
    if (!snapConfigured) return toast("Pembayaran belum dikonfigurasi (.env)", "error");

    setBusy(true);
    try {
      const res = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: mode === "satuan" ? picked : undefined,
          bundleId: mode === "paket" ? bundle.id : undefined,
          productName,
          images,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim permintaan repair");
      pay(data.token, {
        onSuccess: () => finish(data.ref),
        onPending: () => finish(data.ref),
        onError: () => { toast("Pembayaran gagal", "error"); setBusy(false); },
        onClose: () => { toast("Pembayaran dibatalkan", "error"); setBusy(false); },
      });
    } catch (err) {
      toast(err.message, "error");
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-8">
      {/* Hero */}
      <div className="rounded-card bg-ink p-8 text-white md:p-10">
        <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-ink">SHOE CARE</span>
        <h1 className="mt-4 text-3xl font-black md:text-4xl">Repair & Restorasi Sneaker</h1>
        <p className="mt-2 max-w-lg text-white/70">
          Pilih layanan satuan atau paket hemat, upload foto sepatumu, dan bayar langsung.
          Ditangani teknisi berpengalaman.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Mode toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setMode("satuan")}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-bold ${mode === "satuan" ? "border-ink bg-cloud text-ink" : "border-line text-muted hover:border-ink"}`}
            >
              Layanan Satuan
            </button>
            <button
              onClick={() => setMode("paket")}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-bold ${mode === "paket" ? "border-ink bg-cloud text-ink" : "border-line text-muted hover:border-ink"}`}
            >
              Paket Hemat
            </button>
          </div>

          {/* Services */}
          <section className="rounded-card border border-line p-5">
            {mode === "satuan" ? (
              <>
                <h2 className="text-base font-bold text-ink">Pilih Layanan (bisa lebih dari satu)</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {REPAIR_SERVICES.map((s) => {
                    const on = picked.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${on ? "border-ink bg-cloud" : "border-line hover:border-ink"}`}
                      >
                        <span className="text-2xl">{s.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-ink">{s.name}</p>
                          <p className="text-xs text-muted">{s.desc}</p>
                          <p className="text-xs font-semibold text-mint-dark">{formatRupiah(s.price)}</p>
                        </div>
                        {on && <span className="text-mint-dark">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-base font-bold text-ink">Pilih Paket Hemat</h2>
                <div className="mt-4 space-y-3">
                  {SERVICE_BUNDLES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBundle(b)}
                      className={`flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors ${bundle?.id === b.id ? "border-ink bg-cloud" : "border-line hover:border-ink"}`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-ink">{b.name}</p>
                        <p className="text-xs text-muted">{b.desc}</p>
                      </div>
                      <span className="text-sm font-extrabold text-ink">{formatRupiah(b.price)}</span>
                      {bundle?.id === b.id && <span className="text-mint-dark">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Shoe info + photos */}
          <section className="rounded-card border border-line p-5">
            <h2 className="text-base font-bold text-ink">Detail Sepatu</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Nama / Model Sepatu</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="cth. Nike Air Force 1 White"
                  className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Foto Sepatu <span className="text-red-500">*</span>
                </label>
                <ImageUploader value={images} onChange={setImages} max={3} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Catatan (opsional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Keluhan / permintaan khusus"
                  className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-card border border-line p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-ink">Ringkasan</h2>
          <div className="mt-4 space-y-2 text-sm">
            {mode === "satuan" ? (
              REPAIR_SERVICES.filter((s) => picked.includes(s.id)).map((s) => (
                <div key={s.id} className="flex justify-between">
                  <span className="text-muted">{s.name}</span>
                  <span className="font-semibold text-ink">{formatRupiah(s.price)}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between">
                <span className="text-muted">{bundle?.name ?? "Belum pilih"}</span>
                <span className="font-semibold text-ink">{bundle ? formatRupiah(bundle.price) : "—"}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-bold text-ink">Total Bayar</span>
            <span className="text-lg font-black text-ink">{formatRupiah(total)}</span>
          </div>
          <Button size="lg" className="mt-5 w-full" onClick={submit} loading={busy} disabled={total === 0}>
            Bayar & Ajukan Repair
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted">
            Pembayaran via Midtrans. Biaya final bisa menyesuaikan setelah pemeriksaan.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default function RepairPage() {
  return (
    <AuthGate>
      <RepairContent />
    </AuthGate>
  );
}
