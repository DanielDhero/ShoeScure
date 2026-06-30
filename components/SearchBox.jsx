"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ initial = "" }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  const submit = (e) => {
    e.preventDefault();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
  };

  return (
    <form onSubmit={submit} className="flex h-12 items-center gap-2 rounded-lg bg-cloud px-4">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari sneaker, brand, atau model..."
        className="w-full bg-transparent text-sm outline-none"
        autoFocus
      />
    </form>
  );
}
