import { ok, fail, readJson, withUser } from "@/lib/api";
import { core, mapStatus, midtransConfigured } from "@/lib/midtrans";
import { settleOrders, findPayableOwner } from "@/lib/payment";

// Confirm a transaction's status directly with Midtrans, then sync our DB.
// The browser calls this after the Snap popup closes — this is what makes the
// flow work on localhost where Midtrans cannot reach our webhook.
// Body: { ref }
export const POST = withUser(async (user, request) => {
  if (!midtransConfigured()) return fail("Payment gateway belum dikonfigurasi", 503);

  const { ref } = await readJson(request);
  if (!ref) return fail("ref wajib diisi");

  const owns = await findPayableOwner(ref, user.id);
  if (!owns) return fail("Transaksi tidak ditemukan", 404);

  try {
    const stat = await core.transaction.status(ref);
    const mapped = mapStatus(stat.transaction_status, stat.fraud_status);
    await settleOrders(ref, mapped, stat.payment_type);
    return ok({ status: mapped, transactionStatus: stat.transaction_status });
  } catch (e) {
    // 404 = Midtrans has no record yet (e.g. popup closed before paying).
    if (e?.httpStatusCode === "404" || e?.httpStatusCode === 404) {
      return ok({ status: "PENDING", transactionStatus: "not_found" });
    }
    return fail(e.message || "Gagal cek status pembayaran", 502);
  }
});
