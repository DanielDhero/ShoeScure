import { prisma } from "./prisma";

// Apply a confirmed payment status to everything sharing a ref (invoice).
// A ref belongs to exactly one kind: product order, legit check, or repair.
// Used by both the webhook and the client-side status confirmation.
export async function settleOrders(ref, status, paymentType) {
  const paidAt = status === "PAID" ? new Date() : null;

  // --- Product orders ---
  const orders = await prisma.order.findMany({ where: { ref } });
  if (orders.length > 0) {
    await prisma.order.updateMany({
      where: { ref },
      data: { status, paymentType: paymentType || undefined, paidAt },
    });
    // On success: mark the purchased listings SOLD and clear them from carts.
    if (status === "PAID") {
      const listingIds = orders.map((o) => o.listingId).filter(Boolean);
      if (listingIds.length > 0) {
        await prisma.sellListing.updateMany({ where: { id: { in: listingIds } }, data: { status: "SOLD" } });
        await prisma.cartItem.deleteMany({ where: { listingId: { in: listingIds } } });
      }
    }
    return { kind: "PRODUCT", updated: orders.length, userId: orders[0].userId };
  }

  // --- Legit check ---
  const legit = await prisma.legitCheck.updateMany({ where: { ref }, data: { paymentStatus: status, paidAt } });
  if (legit.count > 0) return { kind: "LEGIT", updated: legit.count };

  // --- Repair ---
  const repair = await prisma.repairRequest.updateMany({ where: { ref }, data: { paymentStatus: status, paidAt } });
  if (repair.count > 0) return { kind: "REPAIR", updated: repair.count };

  // --- Coin top-up (idempotent: only credit a PENDING txn once) ---
  const coin = await prisma.coinTransaction.findFirst({ where: { ref } });
  if (coin) {
    if (status === "PAID" && coin.status === "PENDING") {
      await prisma.$transaction([
        prisma.coinTransaction.update({ where: { id: coin.id }, data: { status: "SUCCESS" } }),
        prisma.user.update({ where: { id: coin.userId }, data: { coinBalance: { increment: coin.amount } } }),
      ]);
    } else if (["FAILED", "EXPIRED"].includes(status) && coin.status === "PENDING") {
      await prisma.coinTransaction.update({ where: { id: coin.id }, data: { status: "FAILED" } });
    }
    return { kind: "COIN", updated: 1, userId: coin.userId };
  }

  return { updated: 0 };
}

// Resolve the owner of any payable by ref (for the status-confirm endpoint).
export async function findPayableOwner(ref, userId) {
  const order = await prisma.order.findFirst({ where: { ref, userId }, select: { id: true } });
  if (order) return true;
  const legit = await prisma.legitCheck.findFirst({ where: { ref, userId }, select: { id: true } });
  if (legit) return true;
  const repair = await prisma.repairRequest.findFirst({ where: { ref, userId }, select: { id: true } });
  if (repair) return true;
  const coin = await prisma.coinTransaction.findFirst({ where: { ref, userId }, select: { id: true } });
  return Boolean(coin);
}
