import SearchBox from "@/components/SearchBox";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Cari — ShoeScure" };

export default async function SearchPage({ searchParams }) {
  const { q = "" } = await searchParams;
  const products = q ? await getProducts({ q }) : [];

  return (
    <div className="container-page py-8">
      <h1 className="mb-4 text-3xl font-black text-ink">Cari Produk</h1>
      <SearchBox initial={q} />

      <p className="mb-6 mt-5 text-sm text-muted">
        {q ? `${products.length} hasil untuk "${q}"` : "Ketik untuk mencari sneaker"}
      </p>

      {q && products.length === 0 ? (
        <div className="grid place-items-center rounded-card border border-dashed border-line py-20 text-muted">
          Tidak ada hasil untuk &quot;{q}&quot;
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
