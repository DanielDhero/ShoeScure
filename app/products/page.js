import MarketFilters from "@/components/MarketFilters";
import ProductGrid from "@/components/ProductGrid";
import EmptyState from "@/components/EmptyState";
import { getBrands, getMarketplaceProducts, getActiveSizes } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketplace — ShoeScure" };

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    type: sp.type === "BNIB" || sp.type === "USED" ? sp.type : "all",
    size: sp.size || null,
    brand: sp.brand || null,
    q: sp.q || null,
  };

  const [items, brands, sizes] = await Promise.all([
    getMarketplaceProducts(filters),
    getBrands(),
    getActiveSizes(),
  ]);

  const heading =
    filters.type === "USED" ? "Sneaker Used" : filters.type === "BNIB" ? "Sneaker Brand New" : "Marketplace";

  return (
    <div className="container-page py-8">
      <h1 className="mb-1 text-3xl font-black text-ink">{heading}</h1>
      <p className="mb-5 text-sm text-muted">
        {items.length} produk tersedia dari penjual{filters.size ? ` · ukuran EU ${filters.size}` : ""}
      </p>

      <MarketFilters brands={brands} sizes={sizes} active={filters} />

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Belum ada penjual untuk filter ini"
            subtitle="Coba ganti kondisi/ukuran/brand, atau jadilah yang pertama menjual di sini."
            actionLabel="Jual Sneaker"
            actionHref="/sell"
          />
        ) : (
          <ProductGrid products={items} condition={filters.type} />
        )}
      </div>
    </div>
  );
}
