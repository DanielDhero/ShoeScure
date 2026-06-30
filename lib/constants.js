// Shared static config used by both API routes and UI.

export const COIN_PACKAGES = [
  { id: "coin_1", number: 1, price: 50000, coins: 3 },
  { id: "coin_2", number: 2, price: 75000, coins: 6 },
  { id: "coin_3", number: 3, price: 100000, coins: 10 },
  { id: "coin_4", number: 4, price: 180000, coins: 20 },
];

export const REPAIR_SERVICES = [
  { id: "cleaning", name: "Cleaning", desc: "Pembersihan menyeluruh", icon: "🧼", price: 75000 },
  { id: "reglue", name: "Reglue", desc: "Lem ulang sol terbuka", icon: "🔧", price: 100000 },
  { id: "repaint", name: "Repaint", desc: "Pewarnaan ulang", icon: "🎨", price: 150000 },
  { id: "unyellowing", name: "Unyellowing", desc: "Hilangkan menguning", icon: "☀️", price: 120000 },
];

// Harga legit check: bisa bayar pakai coin ATAU uang (Midtrans).
export const LEGIT_CHECK_PRICE = 50000;
export const LEGIT_CHECK_COIN = 1;

export const SERVICE_BUNDLES = [
  { id: "service_1", name: "SERVICE 1", desc: "Cleaning + Reglue", price: 150000 },
  { id: "service_2", name: "SERVICE 2", desc: "Cleaning + Repaint", price: 200000 },
  { id: "service_3", name: "SERVICE 3", desc: "Cleaning + Unyellowing", price: 175000 },
  { id: "service_4", name: "SERVICE 4", desc: "Cleaning + Reglue + Repaint + Unyellowing", price: 350000 },
];

export const SHIPPING_FEE = 30000;
export const SELL_ADMIN_FEE = 100000;
