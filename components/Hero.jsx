"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

const GRADIENTS = [
  "from-ink to-mint-dark",
  "from-mint-dark to-ink",
  "from-[#0f2027] to-[#2c5364]",
];

export default function Hero({ banners }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!banners?.length) return;
    const t = setInterval(() => setActive((a) => (a + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners]);

  if (!banners?.length) return null;

  return (
    <div className="relative overflow-hidden rounded-card">
      <div className="relative h-[260px] md:h-[400px]">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 flex items-center bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} px-6 transition-opacity duration-700 md:px-12 ${
              i === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="z-10 flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-mint">
                {b.label || "Featured"}
              </p>
              <h2 className="mt-2 max-w-md text-3xl font-black leading-tight text-white md:text-5xl">
                {b.name}
              </h2>
              <p className="mt-3 text-base text-white/80 md:text-lg">
                Mulai dari {formatRupiah(b.price)}
              </p>
              <Link
                href={`/products/${b.slug}`}
                className="mt-5 inline-flex h-11 items-center rounded-full bg-mint px-7 text-sm font-bold text-ink transition-colors hover:bg-white"
              >
                Beli Sekarang
              </Link>
            </div>
            <div className="relative hidden h-full flex-1 md:block">
              <Image src={b.image} alt={b.name} fill className="object-contain p-8" sizes="50vw" />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Banner ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
