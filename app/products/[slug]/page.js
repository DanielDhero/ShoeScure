import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductMarketActions from "@/components/ProductMarketActions";
import ProductGrid from "@/components/ProductGrid";
import { getProductMarket, getRelatedProducts } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getProductMarket(slug);
  return { title: data ? `${data.product.name} — ShoeScure` : "Produk — ShoeScure" };
}

export default async function ProductDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const data = await getProductMarket(slug);
  if (!data) notFound();

  const { product, bnib, used } = data;
  const related = await getRelatedProducts(product);

  const details = [
    ["Retail Price", formatRupiah(product.retailPrice)],
    ["Release Date", product.releaseDate],
    ["Colorway", product.color],
    ["Gender", product.gender],
  ];

  return (
    <div className="container-page py-8">
      <nav className="mb-5 text-sm text-muted">
        <Link href="/products" className="hover:text-ink">
          Marketplace
        </Link>{" "}
        / <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-cloud lg:sticky lg:top-24 lg:self-start">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-contain p-10"
            priority
          />
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-muted">{product.brand.name}</p>
          <h1 className="mt-1 text-3xl font-black text-ink">{product.name}</h1>
          <p className="mt-1 text-sm text-muted">{product.category}</p>

          <ProductMarketActions
            product={product}
            bnib={bnib}
            used={used}
            initialCond={sp.cond || null}
          />

          <div className="mt-8 rounded-card border border-line">
            {details.map(([label, value], i) => (
              <div
                key={label}
                className={`flex justify-between px-4 py-3 text-sm ${
                  i !== details.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <span className="text-muted">{label}</span>
                <span className="font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-lg font-bold text-ink">Deskripsi</h2>
            <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-5 text-2xl font-black text-ink">Produk Serupa</h2>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
