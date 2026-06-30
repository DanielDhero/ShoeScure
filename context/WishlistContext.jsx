"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [ids, setIds] = useState(new Set());

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setIds(new Set());
      return;
    }
    try {
      const res = await fetch("/api/favorites", { cache: "no-store" });
      const data = await res.json();
      const list = data.favorites || [];
      setItems(list);
      setIds(new Set(list.map((p) => p.id)));
    } catch {
      /* ignore */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading) refresh();
  }, [loading, refresh]);

  // Returns { ok, favorited } or { needsAuth: true }
  const toggle = async (productId) => {
    if (!isAuthenticated) return { needsAuth: true };
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    await refresh();
    return { ok: res.ok, favorited: data.favorited };
  };

  const has = (id) => ids.has(id);

  return (
    <WishlistContext.Provider value={{ items, ids, has, toggle, refresh, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
