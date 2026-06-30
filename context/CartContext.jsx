"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      /* ignore */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading) refresh();
  }, [loading, refresh]);

  // Add a specific seller listing to the cart.
  const add = async (listingId) => {
    if (!isAuthenticated) return { needsAuth: true };
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const data = await res.json().catch(() => ({}));
    await refresh();
    return { ok: res.ok, error: data.error };
  };

  const remove = async (id) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await refresh();
  };

  // Each listing is a unique physical pair → quantity is always 1.
  const count = items.length;
  const subtotal = items.reduce((sum, i) => sum + (i.listing?.price ?? 0), 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, add, remove, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
