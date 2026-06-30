"use client";

import { useEffect, useCallback } from "react";

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
// Sandbox URL — for production swap to https://app.midtrans.com/snap/snap.js
const SNAP_URL = "https://app.sandbox.midtrans.com/snap/snap.js";

export const snapConfigured = Boolean(CLIENT_KEY);

// Loads Snap.js once and returns a pay(token, callbacks) function.
// Used by legit-check & repair pages (the product checkout loads Snap itself).
export function useSnapPay() {
  useEffect(() => {
    if (!CLIENT_KEY || typeof window === "undefined") return;
    if (document.getElementById("midtrans-snap")) return;
    const s = document.createElement("script");
    s.id = "midtrans-snap";
    s.src = SNAP_URL;
    s.setAttribute("data-client-key", CLIENT_KEY);
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const pay = useCallback((token, callbacks = {}) => {
    if (typeof window === "undefined" || !window.snap) {
      callbacks.onError?.();
      return;
    }
    window.snap.pay(token, callbacks);
  }, []);

  return pay;
}
