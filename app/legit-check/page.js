"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import Button from "@/components/Button";
import ImageUploader from "@/components/ImageUploader";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useSnapPay, snapConfigured } from "@/components/useSnapPay";
import { LEGIT_CHECK_PRICE, LEGIT_CHECK_COIN } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";

const BRANDS = ["Nike", "Adidas", "Jordan", "New Balance", "Asics", "Vans", "Converse", "Yeezy", "Lainnya"];

const STEPS = [
  { icon: "📸", title: "Upload Foto", desc: "Kirim foto detail sneaker (box, tag, sol, jahitan)." },
  { icon: "🔍", title: "Verifikasi Ahli", desc: "Authenticator memeriksa keaslian produk." },
  { icon: "📜", title: "Sertifikat", desc: "Terima hasil & sertifikat resmi ShoeScure." },
];

function LegitCheckContent() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const pay = useSnapPay();

  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [images, setImages] = useState([]);
  const [payMethod, setPayMethod] = useState("COIN");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const balance = user?.coinBalance ?? 0;

  const showResult = async (check) => {
    await refresh();
    setResult(check);
  };

  const finishCash = async (ref, check) => {
    try {
      await fetch("/api/payment/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      });
    } catch { /* webhook reconciles */ }
    showResult(check);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast("Wajib upload foto produk", "error");
    if (payMethod === "COIN" && balance < LEGIT_CHECK_COIN) {
      toast("Coin tidak cukup. Pilih bayar pakai uang atau top up.", "error");
      return;
    }
    if (payMethod === "CASH" && !snapConfigured) return toast("Pembayaran belum dikonfigurasi (.env)", "error");

    setBusy(true);
    try {
      const res = await fetch("/api/legit-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, productName, images, payMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim legit check");

      if (data.paid) {
        toast("Legit check terkirim! 1 coin terpakai.", "success");
        showResult(data.check);
      } else {
        pay(data.token, {
          onSuccess: () => finishCash(data.ref, data.check),
          onPending: () => finishCash(data.ref, data.check),
          onError: () => { toast("Pembayaran gagal", "error"); setBusy(false); },
          onClose: () => { toast("Pembayaran dibatalkan", "error"); setBusy(false); },
        });
      }
    } catch (err) {
      toast(err.message, "error");
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="container-page grid place-items-center py-16">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mint-soft text-3xl">📜</div>
          <h1 className="mt-6 text-2xl font-black text-ink">Permintaan Diterima!</h1>
          <p className="mt-2 text-sm text-muted">Legit check kamu sedang diproses authenticator kami.</p>
          <div className="mt-6 rounded-card border border-line p-5 text-left text-sm">
            <div className="flex justify-between border-b border-line pb-3">
              <span className="text-muted">No. Sertifikat</span>
              <span className="font-bold text-ink">{result.certNo}</span>
            </div>
            <div className="flex justify-between border-b border-line py-3">
              <span className="text-muted">Produk</span>
              <span className="font-semibold text-ink">{result.brand} {result.productName}</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-muted">Status</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{result.status}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="/account/my-legit-check" size="lg" className="flex-1">Riwayat Legit Check</Button>
            <Button variant="outline" size="lg" className="flex-1" onClick={() => {
              setResult(null); setBrand(""); setProductName(""); setImages([]); setBusy(false);
            }}>
              Cek Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      {/* Hero */}
      <div className="rounded-card bg-ink p-8 text-white md:p-10">
        <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-ink">100% TERPERCAYA</span>
        <h1 className="mt-4 text-3xl font-black md:text-4xl">Legit Check Sneaker</h1>
        <p className="mt-2 max-w-lg text-white/70">
          Pastikan sneakermu asli. Diverifikasi authenticator bersertifikat. Bayar pakai
          {" "}{LEGIT_CHECK_COIN} coin atau {formatRupiah(LEGIT_CHECK_PRICE)}.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="rounded-card border border-line p-5">
            <div className="text-3xl">{s.icon}</div>
            <p className="mt-3 text-xs font-bold text-mint-dark">LANGKAH {i + 1}</p>
            <h3 className="text-base font-bold text-ink">{s.title}</h3>
            <p className="mt-1 text-sm text-muted">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-card border border-line p-6">
          <h2 className="text-lg font-bold text-ink">Detail Produk</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Brand</label>
              <select
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
              >
                <option value="" disabled>Pilih brand</option>
                {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Nama / Model Produk</label>
              <input
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="cth. Air Jordan 1 High Chicago"
                className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Foto Produk <span className="text-red-500">*</span>
              </label>
              <ImageUploader value={images} onChange={setImages} max={4} />
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-card border border-line p-5">
          <h2 className="text-base font-bold text-ink">Metode Pembayaran</h2>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => setPayMethod("COIN")}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left ${payMethod === "COIN" ? "border-ink bg-cloud" : "border-line hover:border-ink"}`}
            >
              <div>
                <p className="text-sm font-bold text-ink">Bayar Coin</p>
                <p className="text-xs text-muted">Saldo: 🪙 {balance}</p>
              </div>
              <span className="text-sm font-bold text-ink">{LEGIT_CHECK_COIN} 🪙</span>
            </button>
            <button
              type="button"
              onClick={() => setPayMethod("CASH")}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left ${payMethod === "CASH" ? "border-ink bg-cloud" : "border-line hover:border-ink"}`}
            >
              <div>
                <p className="text-sm font-bold text-ink">Bayar Uang</p>
                <p className="text-xs text-muted">via Midtrans</p>
              </div>
              <span className="text-sm font-bold text-ink">{formatRupiah(LEGIT_CHECK_PRICE)}</span>
            </button>
          </div>

          <Button type="submit" size="lg" className="mt-4 w-full" loading={busy}>
            {payMethod === "COIN" ? `Kirim (${LEGIT_CHECK_COIN} Coin)` : `Bayar ${formatRupiah(LEGIT_CHECK_PRICE)}`}
          </Button>
          {payMethod === "COIN" && balance < LEGIT_CHECK_COIN && (
            <Link href="/coins" className="mt-3 block text-center text-xs font-semibold text-mint-dark hover:underline">
              Coin kurang — Top Up dulu
            </Link>
          )}
        </aside>
      </form>
    </div>
  );
}

export default function LegitCheckPage() {
  return (
    <AuthGate>
      <LegitCheckContent />
    </AuthGate>
  );
}
