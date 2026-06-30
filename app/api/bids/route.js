import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, withUser } from "@/lib/api";

// GET ?role=buyer (default) → bids I placed.
// GET ?role=seller → bids on products where I have an ACTIVE listing.
export const GET = withUser(async (user, request) => {
  const role = request.nextUrl.searchParams.get("role") || "buyer";

  if (role === "seller") {
    const myListings = await prisma.sellListing.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { productId: true, size: true, type: true },
    });
    if (myListings.length === 0) return ok({ bids: [] });
    const keys = new Set(myListings.map((l) => `${l.productId}|${l.size}|${l.type}`));

    const candidates = await prisma.bid.findMany({
      where: { status: { in: ["PENDING", "COUNTERED"] }, userId: { not: user.id } },
      include: { product: { include: { brand: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    const bids = candidates.filter((b) => keys.has(`${b.productId}|${b.size}|${b.type}`));
    return ok({ bids });
  }

  const bids = await prisma.bid.findMany({
    where: { userId: user.id },
    include: { product: { include: { brand: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok({ bids });
});

// Place a bid. Body: { productId, size, type, amount }
export const POST = withUser(async (user, request) => {
  const { productId, size, type, amount } = await readJson(request);
  if (!productId || !size || !amount) return fail("productId, size, dan amount wajib diisi");
  if (Number(amount) < 50000) return fail("Tawaran minimal Rp 50.000");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return fail("Produk tidak ditemukan", 404);

  const bid = await prisma.bid.create({
    data: {
      userId: user.id,
      productId,
      size: Number(size),
      type: type === "USED" ? "USED" : "BNIB",
      amount: Number(amount),
      status: "PENDING",
    },
  });
  return ok({ bid });
});

// Actions. Body: { id, action: "accept"|"reject"|"counter"|"cancel", counterAmount? }
export const PATCH = withUser(async (user, request) => {
  const { id, action, counterAmount } = await readJson(request);
  if (!id || !action) return fail("id dan action wajib diisi");

  const bid = await prisma.bid.findUnique({ where: { id } });
  if (!bid) return fail("Tawaran tidak ditemukan", 404);

  // Buyer cancels their own pending bid.
  if (action === "cancel") {
    if (bid.userId !== user.id) return fail("Bukan tawaranmu", 403);
    if (!["PENDING", "COUNTERED"].includes(bid.status)) return fail("Tawaran tidak bisa dibatalkan");
    const updated = await prisma.bid.update({ where: { id }, data: { status: "CANCELLED" } });
    return ok({ bid: updated });
  }

  // Seller accept / reject / counter — must own a matching ACTIVE listing.
  if (["accept", "reject", "counter"].includes(action)) {
    const listing = await prisma.sellListing.findFirst({
      where: { userId: user.id, productId: bid.productId, size: bid.size, type: bid.type, status: "ACTIVE" },
      orderBy: { price: "asc" },
    });
    if (!listing) return fail("Kamu tidak punya listing yang cocok untuk tawaran ini", 403);

    if (action === "reject") {
      const updated = await prisma.bid.update({ where: { id }, data: { status: "REJECTED" } });
      return ok({ bid: updated });
    }
    if (action === "accept") {
      const updated = await prisma.bid.update({
        where: { id },
        data: { status: "ACCEPTED", listingId: listing.id },
      });
      return ok({ bid: updated });
    }
    // counter
    if (!counterAmount || Number(counterAmount) < 50000) return fail("Counter amount tidak valid");
    const updated = await prisma.bid.update({
      where: { id },
      data: { status: "COUNTERED", amount: Number(counterAmount), listingId: listing.id },
    });
    return ok({ bid: updated });
  }

  return fail("Action tidak dikenal");
});
