import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, withUser } from "@/lib/api";

export const GET = withUser(async (user) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { brand: true } }, listing: true },
    orderBy: { createdAt: "desc" },
  });
  // Drop items whose listing was sold/removed in the meantime.
  const valid = items.filter((i) => i.listing && i.listing.status === "ACTIVE");
  return ok({ items: valid });
});

// Add a specific listing to cart. Body: { listingId }
export const POST = withUser(async (user, request) => {
  const { listingId } = await readJson(request);
  if (!listingId) return fail("listingId wajib diisi");

  const listing = await prisma.sellListing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "ACTIVE") return fail("Listing tidak tersedia", 404);
  if (listing.userId === user.id) return fail("Tidak bisa membeli barangmu sendiri");

  const item = await prisma.cartItem.upsert({
    where: { userId_listingId: { userId: user.id, listingId } },
    update: {},
    create: {
      userId: user.id,
      productId: listing.productId,
      listingId,
      size: listing.size,
      quantity: 1,
    },
  });
  return ok({ item });
});

// Remove from cart. Body: { id }
export const DELETE = withUser(async (user, request) => {
  const { id } = await readJson(request);
  if (!id) return fail("id wajib diisi");
  await prisma.cartItem.deleteMany({ where: { id, userId: user.id } });
  return ok({ success: true });
});
