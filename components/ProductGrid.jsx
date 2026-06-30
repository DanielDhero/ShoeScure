import ProductCard from "./ProductCard";

export default function ProductGrid({ products, condition }) {
  if (!products || products.length === 0) {
    return (
      <div className="grid place-items-center rounded-card border border-dashed border-line py-20 text-muted">
        Tidak ada produk.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} condition={condition} />
      ))}
    </div>
  );
}
