import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, withUser } from "@/lib/api";
import { randomRef } from "@/lib/format";
import { LEGIT_CHECK_PRICE, LEGIT_CHECK_COIN } from "@/lib/constants";
import { createSnapTransaction, midtransConfigured } from "@/lib/midtrans";

export const GET = withUser(async (user) => {
  const checks = await prisma.legitCheck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return ok({ checks });
});

// Submit a legit check. Photos required. Pay with COIN or CASH (Midtrans).
// Body: { brand, productName, images: [url], payMethod: "COIN" | "CASH" }
export const POST = withUser(async (user, request) => {
  const { brand, productName, images, payMethod } = await readJson(request);
  if (!brand || !productName) return fail("Brand dan nama produk wajib diisi");
  if (!Array.isArray(images) || images.length === 0) return fail("Wajib upload foto produk");

  const ref = randomRef("LC");
  const imagesJson = JSON.stringify(images);

  // --- Pay with coin (instant) ---
  if (payMethod !== "CASH") {
    const fresh = await prisma.user.findUnique({ where: { id: user.id } });
    if (fresh.coinBalance < LEGIT_CHECK_COIN) {
      return fail("Coin tidak cukup. Top up atau bayar pakai uang.", 402);
    }
    const check = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { coinBalance: { decrement: LEGIT_CHECK_COIN } } });
      await tx.coinTransaction.create({
        data: { userId: user.id, type: "SPEND", amount: LEGIT_CHECK_COIN, description: `Legit Check — ${productName}` },
      });
      return tx.legitCheck.create({
        data: {
          userId: user.id,
          brand,
          productName,
          images: imagesJson,
          payMethod: "COIN",
          paymentStatus: "PAID",
          paidAt: new Date(),
          status: "In Review",
          certNo: ref,
          ref,
        },
      });
    });
    return ok({ check, paid: true });
  }

  // --- Pay with cash (Midtrans) ---
  if (!midtransConfigured()) {
    return fail("Payment gateway belum dikonfigurasi. Set MIDTRANS_SERVER_KEY di .env", 503);
  }
  const check = await prisma.legitCheck.create({
    data: {
      userId: user.id,
      brand,
      productName,
      images: imagesJson,
      price: LEGIT_CHECK_PRICE,
      payMethod: "CASH",
      paymentStatus: "PENDING",
      status: "In Review",
      certNo: ref,
      ref,
    },
  });
  try {
    const tx = await createSnapTransaction({
      ref,
      grossAmount: LEGIT_CHECK_PRICE,
      items: [{ id: "LEGIT", price: LEGIT_CHECK_PRICE, quantity: 1, name: `Legit Check ${brand}`.slice(0, 50) }],
      user,
      origin: request.nextUrl.origin,
    });
    await prisma.legitCheck.update({ where: { id: check.id }, data: { snapToken: tx.token } });
    return ok({ check, token: tx.token, ref, total: LEGIT_CHECK_PRICE });
  } catch (e) {
    await prisma.legitCheck.delete({ where: { id: check.id } });
    return fail(e.message || "Gagal membuat transaksi", 502);
  }
});
