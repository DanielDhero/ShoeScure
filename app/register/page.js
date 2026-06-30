"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/Button";
import { validatePassword, PASSWORD_RULE } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast(passwordError, "error");
      return;
    }
    if (password !== confirm) {
      toast("Konfirmasi password tidak cocok", "error");
      return;
    }
    setBusy(true);
    try {
      await register(name, email, password);
      toast("Akun berhasil dibuat!", "success");
      router.push("/account");
      router.refresh();
    } catch (err) {
      toast(err.message || "Registrasi gagal", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Link href="/" className="text-2xl font-black tracking-tight">
          Shoe<span className="text-mint">Scure</span>
        </Link>
        <div>
          <h2 className="text-4xl font-black leading-tight">
            Gabung komunitas
            <br />
            sneakerhead Indonesia.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Dapatkan 1.000 coin gratis saat mendaftar — pakai untuk Legit Check dan
            nikmati semua fitur ShoeScure.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            {[
              "Marketplace buy & sell sneaker authentic",
              "Legit Check oleh ahli bersertifikat",
              "Layanan Repair profesional",
              "Coin wallet untuk transaksi mudah",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-mint text-ink">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/40">© ShoeScure {new Date().getFullYear()}</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-block text-2xl font-black tracking-tight lg:hidden">
            Shoe<span className="text-mint-dark">Scure</span>
          </Link>
          <h1 className="text-2xl font-black text-ink">Buat akun baru</h1>
          <p className="mt-1 text-sm text-muted">Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-mint-dark hover:underline">
              Masuk di sini
            </Link>
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Nama lengkap</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Konfirmasi</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-ink"
                />
              </div>
            </div>
            <p className="text-xs text-muted">{PASSWORD_RULE}</p>
            <Button type="submit" size="lg" className="w-full" loading={busy}>
              Daftar
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted">
            Dengan mendaftar, kamu menyetujui Syarat & Ketentuan ShoeScure.
          </p>
        </div>
      </div>
    </div>
  );
}
