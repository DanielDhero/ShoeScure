// Currency & misc formatting helpers (Indonesian Rupiah)

export function formatRupiah(value, { withSymbol = true } = {}) {
  const number = Number(value) || 0;
  const formatted = Math.round(number)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return withSymbol ? `Rp ${formatted}` : formatted;
}

export function parseRupiah(str) {
  return Number(String(str).replace(/[^0-9]/g, "")) || 0;
}

export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function randomRef(prefix = "") {
  // Deterministic-ish reference using time; fine for demo data.
  const n = Date.now().toString().slice(-9);
  return `${prefix}${n}`;
}
