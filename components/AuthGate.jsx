"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import EmptyState from "./EmptyState";

// Wraps client pages that require a logged-in user.
// Shows a spinner while resolving, a login prompt when signed out.
export default function AuthGate({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="container-page grid place-items-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon="🔒"
          title="Login terlebih dahulu"
          subtitle="Kamu perlu masuk ke akun untuk mengakses halaman ini."
          actionLabel="Masuk / Daftar"
          actionHref={`/login?next=${encodeURIComponent(pathname)}`}
        />
      </div>
    );
  }

  return children;
}
