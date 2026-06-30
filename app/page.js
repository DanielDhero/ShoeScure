import Link from "next/link";
import Hero from "@/components/Hero";
import FilterableGrid from "@/components/FilterableGrid";
import { getBanners, getBrands, getFeaturedProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

const VALUE_PROPS = [
  { icon: "🛡️", title: "100% Authentic", desc: "Setiap produk lolos legit check", href: "/legit-check" },
  { icon: "✨", title: "Repair Service", desc: "Rawat sneakermu seperti baru", href: "/repair" },
  { icon: "💸", title: "Buy & Sell", desc: "Jual beli aman & transparan", href: "/products" },
  { icon: "🚀", title: "Fast Shipping", desc: "Pengiriman cepat se-Indonesia", href: "/products" },
];

export default async function HomePage() {
  const [banners, brands, products] = await Promise.all([
    getBanners(),
    getBrands(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="container-page py-6">
      <Hero banners={banners} />

      {/* Value props */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {VALUE_PROPS.map((v) => (
          <Link
            key={v.title}
            href={v.href}
            className="flex items-center gap-3 rounded-card border border-line bg-cloud p-4 transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-white hover:shadow-md"
          >
            <span className="text-2xl">{v.icon}</span>
            <div>
              <p className="text-sm font-bold text-ink">{v.title}</p>
              <p className="hidden text-xs text-muted md:block">{v.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Catalog */}
      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">Untuk Kamu</h2>
            <p className="text-sm text-muted">Koleksi sneaker autentik pilihan</p>
          </div>
        </div>
        <FilterableGrid products={products} brands={brands} />
      </section>
    </div>
  );
}
