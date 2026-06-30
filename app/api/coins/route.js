import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, withUser } from "@/lib/api";
import { COIN_PACKAGES } from "@/lib/constants";
import { randomRef } from "@/lib/format";
import { createSnapTransaction, midtransConfigured } from "@/lib/midtrans";

export const GET = withUser(async (user) => {
  const history = await prisma.coinTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const fresh = await prisma.user.findUnique({ where: { id: user.id } });
  return ok({ balance: fresh.coinBalance, history });
});

// Top up coins via Midtrans. Coins are credited only after payment (settleOrders).
// Body: { packageId }
export const POST = withUser(async (user, request) => {
  const { packageId } = await readJson(request);
  const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return fail("Paket tidak valid");

  if (!midtransConfigured()) {
    return fail("Payment gateway belum dikonfigurasi. Set MIDTRANS_SERVER_KEY di .env", 503);
  }

  const ref = randomRef("TOP");
  const txn = await prisma.coinTransaction.create({
    data: {
      userId: user.id,
      type: "TOPUP",
      amount: pkg.coins,
      price: pkg.price,
      description: `Top Up ${pkg.coins} Coin ShoeScure`,
      status: "PENDING",
      ref,
    },
  });

  try {
    const tx = await createSnapTransaction({
      ref,
      grossAmount: pkg.price,
      items: [{ id: pkg.id, price: pkg.price, quantity: 1, name: `Top Up ${pkg.coins} Coin`.slice(0, 50) }],
      user,
      origin: request.nextUrl.origin,
    });
    await prisma.coinTransaction.update({ where: { id: txn.id }, data: { snapToken: tx.token } });
    return ok({ token: tx.token, ref, total: pkg.price, coins: pkg.coins });
  } catch (e) {
    await prisma.coinTransaction.delete({ where: { id: txn.id } });
    return fail(e.message || "Gagal membuat transaksi", 502);
  }
});
