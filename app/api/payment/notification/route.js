import crypto from "crypto";
import { ok, fail } from "@/lib/api";
import { mapStatus } from "@/lib/midtrans";
import { settleOrders } from "@/lib/payment";

// Midtrans server-to-server webhook (Payment Notification URL).
// This is the source of truth for payment status in production.
// Configure the URL in the Midtrans dashboard: <your-domain>/api/payment/notification
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Body tidak valid", 400);
  }

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    payment_type,
  } = body;

  // Verify the signature: sha512(order_id + status_code + gross_amount + ServerKey)
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const expected = crypto
    .createHash("sha512")
    .update(order_id + status_code + gross_amount + serverKey)
    .digest("hex");

  if (!signature_key || signature_key !== expected) {
    return fail("Signature tidak valid", 403);
  }

  const mapped = mapStatus(transaction_status, fraud_status);
  await settleOrders(order_id, mapped, payment_type);

  return ok({ received: true });
}
