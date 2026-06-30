"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const TYPES = [
  { key: "all", label: "Semua" },
  { key: "BNIB", label: "Brand New" },
  { key: "USED", label: "Used" },
];

export default function MarketFilters({ brands = [], sizes = [], active }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key, value) => {
    const sp = new URLSearchParams(params.toString());
    if (!value || value === "all") sp.delete(key);
    else sp.set(key, value);
    router.push(`${pathname}?${sp.toString()}`);
  };

  const chip = (selected) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
      selected ? "border-ink bg-ink text-white" : "border-line bg-white text-gray-600 hover:border-ink"
    }`;

  return (
    <div className="space-y-3">
      {/* Condition tabs */}
      <div className="flex gap-2">
        {TYPES.map((t) => (
          <button key={t.key} onClick={() => setParam("type", t.key)} className={chip(active.type === t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Size filter */}
      {sizes.length > 0 && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button onClick={() => setParam("size", "all")} className={chip(!active.size)}>
            Semua Size
          </button>
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setParam("size", String(s))}
              className={chip(String(active.size) === String(s))}
            >
              EU {s}
            </button>
          ))}
        </div>
      )}

      {/* Brand filter */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button onClick={() => setParam("brand", "all")} className={chip(!active.brand || active.brand === "all")}>
          Semua Brand
        </button>
        {brands.map((b) => (
          <button key={b.slug} onClick={() => setParam("brand", b.slug)} className={chip(active.brand === b.slug)}>
            {b.name}
          </button>
        ))}
      </div>
    </div>
  );
}
