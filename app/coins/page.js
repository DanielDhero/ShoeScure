"use client";

import { useEffect, useState, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useSnapPay, snapConfigured } from "@/components/useSnapPay";
import { COIN_PACKAGES } from "@/lib/constants";
import { formatRupiah, formatDate } from "@/lib/format";

function CoinsContent() {
  const { refresh: refreshUser } = useAuth();
  const { toast } = useToast();
  const pay = useSnapPay();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(COIN_PACKAGES[1].id);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/coins", { cache: "no-store" });
    const data = await res.json();
    setBalance(data.balance || 0);
    setHistory(data.history || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const finish = async (ref) => {
    try {
      await fetch("/api/payment/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      });
    } catch { /* webhook reconciles */ }
    await load();
    await refreshUser();
    toast("Top up berhasil! 🪙", "success");
    setBusy(false);
  };

  const topUp = async () => {
    if (!snapConfigured) return toast("Pembayaran belum dikonfigurasi (.env)", "error");
    setBusy(true);
    try {
      const res = await fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Top up gagal");
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
      <h1 className="text-2xl font-black text-ink">Coin Wallet</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Packages */}
          <section className="rounded-card border border-line p-6">
            <h2 className="text-lg font-bold text-ink">Pilih Paket Top Up</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {COIN_PACKAGES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`flex flex-col items-center rounded-card border p-4 transition-colors ${
                    selected === p.id ? "border-ink bg-cloud" : "border-line hover:border-ink"
                  }`}
                >
                  <span className="text-2xl">🪙</span>
                  <span className="mt-2 text-lg font-black text-ink">{p.coins}</span>
                  <span className="text-[11px] text-muted">Coin</span>
                  <span className="mt-2 text-xs font-semibold text-mint-dark">{formatRupiah(p.price)}</span>
                </button>
              ))}
            </div>
          </section>

          {/* History */}
          <section className="rounded-card border border-line p-6">
            <h2 className="text-lg font-bold text-ink">Riwayat Transaksi</h2>
            {history.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Belum ada transaksi coin.</p>
            ) : (
              <div className="mt-4 divide-y divide-line">
                {history.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{tx.description}</p>
                      <p className="flex items-center gap-2 text-xs text-muted">
                        {formatDate(tx.createdAt)}
                        {tx.status !== "SUCCESS" && <StatusBadge status={tx.status} />}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${tx.status !== "SUCCESS" ? "text-muted line-through" : tx.type === "TOPUP" ? "text-mint-dark" : "text-red-500"}`}>
                      {tx.type === "TOPUP" ? "+" : "−"}{tx.amount} 🪙
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Balance / checkout */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-card bg-ink p-6 text-white">
            <p className="text-sm text-white/60">Saldo Coin</p>
            <p className="mt-1 text-4xl font-black">🪙 {balance}</p>
            <p className="mt-2 text-xs text-white/50">1 coin = 1x Legit Check</p>
          </div>
          <div className="rounded-card border border-line p-5">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Paket dipilih</span>
              <span className="font-semibold text-ink">
                {COIN_PACKAGES.find((p) => p.id === selected)?.coins} Coin
              </span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted">Total bayar</span>
              <span className="font-bold text-ink">
                {formatRupiah(COIN_PACKAGES.find((p) => p.id === selected)?.price)}
              </span>
            </div>
            <Button size="lg" className="mt-4 w-full" onClick={topUp} loading={busy}>
              Top Up Sekarang
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CoinsPage() {
  return (
    <AuthGate>
      <CoinsContent />
    </AuthGate>
  );
}
