"use client";

import { useState, useEffect } from "react";
import AccountLayout from "@/components/AccountLayout";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function ProfileContent() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      await refresh();
      toast("Profil berhasil diperbarui", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-ink">Profil Saya</h1>
      <p className="mt-1 text-sm text-muted">Kelola informasi akun dan pengirimanmu.</p>

      <form onSubmit={save} className="mt-6 max-w-xl rounded-card border border-line p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Nama lengkap</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="h-12 w-full rounded-lg border border-line bg-cloud px-4 text-sm text-muted"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">No. Telepon</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Alamat</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Alamat pengiriman default"
              className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </div>
        </div>
        <Button type="submit" size="lg" className="mt-6" loading={busy}>
          Simpan Perubahan
        </Button>
      </form>
    </div>
  );
}

export default function AccountPage() {
  return (
    <AccountLayout>
      <ProfileContent />
    </AccountLayout>
  );
}
