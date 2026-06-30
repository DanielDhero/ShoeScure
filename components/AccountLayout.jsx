"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthGate from "./AuthGate";
import { useAuth } from "@/context/AuthContext";

const MENU = [
  { label: "Profil Saya", href: "/account", icon: "👤" },
  { label: "Pembelian", href: "/account/my-purchase", icon: "📦" },
  { label: "Penjualan", href: "/account/my-selling", icon: "🏷️" },
  { label: "Tawaran", href: "/account/bids", icon: "🤝" },
  { label: "Legit Check", href: "/account/my-legit-check", icon: "📜" },
  { label: "Repair", href: "/account/my-repair", icon: "🔧" },
  { label: "Coin Wallet", href: "/coins", icon: "🪙" },
];

function Shell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit">
          <div className="rounded-card border border-line p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-ink text-lg font-black text-white">
                {(user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-mint-soft px-3 py-2">
              <span className="text-xs font-semibold text-ink">Saldo Coin</span>
              <span className="text-sm font-black text-mint-dark">🪙 {user?.coinBalance ?? 0}</span>
            </div>
          </div>

          <nav className="mt-4 rounded-card border border-line p-2">
            {MENU.map((m) => {
              const active = pathname === m.href;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-ink text-white" : "text-ink hover:bg-cloud"
                  }`}
                >
                  <span>{m.icon}</span>
                  {m.label}
                </Link>
              );
            })}
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
            >
              <span>🚪</span>
              Keluar
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

export default function AccountLayout({ children }) {
  return (
    <AuthGate>
      <Shell>{children}</Shell>
    </AuthGate>
  );
}
