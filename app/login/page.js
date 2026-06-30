"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/Button";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const next = params.get("next") || "/account";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast("Selamat datang kembali!", "success");
      router.push(next);
      router.refresh();
    } catch (err) {
      toast(err.message || "Login gagal", "error");
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => {
    setEmail("demo@shoescure.com");
    setPassword("password123");
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
            Marketplace sneaker
            <br />
            paling terpercaya.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Beli, jual, legit check, dan repair sneaker favoritmu — 100% authentic
            guaranteed.
          </p>
          <div className="mt-8 flex gap-8">
            <div>
              <p className="text-3xl font-black text-mint">100%</p>
              <p className="text-sm text-white/60">Authentic</p>
            </div>
            <div>
              <p className="text-3xl font-black text-mint">12K+</p>
              <p className="text-sm text-white/60">Produk</p>
            </div>
            <div>
              <p className="text-3xl font-black text-mint">24/7</p>
              <p className="text-sm text-white/60">Support</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-white/40">© ShoeScure {new Date().getFullYear()}</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-block text-2xl font-black tracking-tight lg:hidden">
            Shoe<span className="text-mint-dark">Scure</span>
          </Link>
          <h1 className="text-2xl font-black text-ink">Masuk ke akunmu</h1>
          <p className="mt-1 text-sm text-muted">Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-mint-dark hover:underline">
              Daftar gratis
            </Link>
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
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
            <Button type="submit" size="lg" className="w-full" loading={busy}>
              Masuk
            </Button>
          </form>

          <button
            onClick={fillDemo}
            className="mt-4 w-full rounded-lg border border-dashed border-line bg-cloud px-4 py-3 text-left text-xs text-muted transition-colors hover:border-mint-dark"
          >
            <span className="font-semibold text-ink">Coba akun demo →</span> isi otomatis
            demo@shoescure.com / password123
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
