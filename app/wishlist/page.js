"use client";

import AuthGate from "@/components/AuthGate";
import ProductGrid from "@/components/ProductGrid";
import EmptyState from "@/components/EmptyState";
import { useWishlist } from "@/context/WishlistContext";

function WishlistContent() {
  const { items } = useWishlist();

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-black text-ink">Wishlist</h1>
      <p className="mt-1 text-sm text-muted">
        {items.length > 0
          ? `${items.length} produk tersimpan`
          : "Simpan sneaker favoritmu di sini"}
      </p>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Wishlist masih kosong"
            subtitle="Tekan ikon hati pada produk untuk menyimpannya ke wishlist."
            actionLabel="Jelajahi Sneaker"
            actionHref="/products"
          />
        ) : (
          <ProductGrid products={items} />
        )}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <AuthGate>
      <WishlistContent />
    </AuthGate>
  );
}
