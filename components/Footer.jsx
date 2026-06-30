import Link from "next/link";

const COLUMNS = [
  {
    title: "ShoeScure",
    links: [
      { label: "Tentang Kami", href: "/account" },
      { label: "Cara Kerja", href: "/" },
      { label: "Karir", href: "/" },
      { label: "Blog", href: "/" },
    ],
  },
  {
    title: "Layanan",
    links: [
      { label: "Beli Sneaker", href: "/products" },
      { label: "Jual Sneaker", href: "/products" },
      { label: "Legit Check", href: "/legit-check" },
      { label: "Repair", href: "/repair" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Pusat Bantuan", href: "/" },
      { label: "Cara Pembayaran", href: "/" },
      { label: "Pengiriman", href: "/" },
      { label: "Pengembalian", href: "/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <p className="text-xl font-black">
              Shoe<span className="text-mint">Scure</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              Marketplace sneaker autentik dengan jaminan legit check & layanan repair terpercaya di
              Indonesia.
            </p>
            <div className="mt-4 flex gap-2">
              {["IG", "TT", "X", "WA"].map((s) => (
                <span
                  key={s}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xs font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 font-semibold">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-gray-400 transition-colors hover:text-mint">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-400 md:flex-row md:items-center">
          <p>© 2026 ShoeScure. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
