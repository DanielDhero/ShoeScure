import midtransClient from "midtrans-client";

// Toggle via env; defaults to sandbox so local dev is safe.
export const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

// Snap = the popup checkout. CoreApi = for querying transaction status.
export const snap = new midtransClient.Snap({ isProduction, serverKey, clientKey });
export const core = new midtransClient.CoreApi({ isProduction, serverKey, clientKey });

export function midtransConfigured() {
  return Boolean(serverKey);
}

// Snap.js script URL — sandbox vs production.
export const SNAP_SCRIPT_URL = isProduction
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

// Public client key (safe to expose to the browser for Snap.js).
export const publicClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || clientKey;

// Shared Snap transaction builder, reused by product, legit-check & repair payments.
// items: [{ id, price, quantity, name }] — sum must equal grossAmount.
export async function createSnapTransaction({ ref, grossAmount, items, user, origin }) {
  const [firstName, ...rest] = (user.name || "Pelanggan").split(" ");
  return snap.createTransaction({
    transaction_details: { order_id: ref, gross_amount: grossAmount },
    item_details: items,
    customer_details: {
      first_name: firstName,
      last_name: rest.join(" ") || undefined,
      email: user.email,
      phone: user.phone || undefined,
    },
    callbacks: { finish: `${origin}/payment-success?ref=${ref}` },
  });
}

// Map Midtrans transaction_status -> our Order.status
export function mapStatus(transactionStatus, fraudStatus) {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "accept" ? "PAID" : "PENDING";
    case "settlement":
      return "PAID";
    case "pending":
      return "PENDING";
    case "deny":
    case "cancel":
    case "failure":
      return "FAILED";
    case "expire":
      return "EXPIRED";
    default:
      return "PENDING";
  }
}
