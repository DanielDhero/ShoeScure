"use client";

import { useState } from "react";
import ProductGrid from "./ProductGrid";

export default function FilterableGrid({ products, brands }) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all" ? products : products.filter((p) => p.brand?.slug === active);

  const chips = [{ slug: "all", name: "Semua" }, ...brands];

  return (
    <div>
      <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map((b) => (
          <button
            key={b.slug}
            onClick={() => setActive(b.slug)}
            className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
              active === b.slug
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-gray-600 hover:border-ink"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>
      <ProductGrid products={filtered} />
    </div>
  );
}
