import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, withUser } from "@/lib/api";

export const GET = withUser(async (user) => {
  const listings = await prisma.sellListing.findMany({
    where: { userId: user.id },
    include: { product: { include: { brand: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok({ listings });
});

// Create a sell listing. Body: { productId, size, price, type, condition, image }
export const POST = withUser(async (user, request) => {
  const { productId, size, price, type, condition, image } = await readJson(request);
  if (!productId || !size || !price) {
    return fail("productId, size, dan price wajib diisi");
  }
  const listingType = type === "USED" ? "USED" : "BNIB";
  // Used items must include a real photo of the actual pair.
  if (listingType === "USED" && !image) {
    return fail("Wajib upload foto produk untuk barang Used");
  }
  const listing = await prisma.sellListing.create({
    data: {
      userId: user.id,
      productId,
      size: Number(size),
      price: Number(price),
      type: listingType,
      condition: condition || (listingType === "USED" ? "Used - Good" : "Brand New"),
      image: image || null,
      status: "ACTIVE",
    },
  });
  return ok({ listing });
});

// Edit a listing. Body: { id, price?, condition?, image?, status? }
export const PATCH = withUser(async (user, request) => {
  const { id, price, condition, image, status } = await readJson(request);
  if (!id) return fail("id wajib diisi");

  const listing = await prisma.sellListing.findUnique({ where: { id } });
  if (!listing || listing.userId !== user.id) return fail("Listing tidak ditemukan", 404);
  if (listing.status === "SOLD") return fail("Listing yang sudah terjual tidak bisa diubah");

  const data = {};
  if (price != null) {
    if (Number(price) < 50000) return fail("Harga minimal Rp 50.000");
    data.price = Number(price);
  }
  if (condition) data.condition = condition;
  if (image !== undefined) {
    if (listing.type === "USED" && !image) return fail("Barang Used wajib punya foto");
    data.image = image || null;
  }
  if (status && ["ACTIVE", "INACTIVE"].includes(status)) data.status = status;
  if (Object.keys(data).length === 0) return fail("Tidak ada perubahan");

  const updated = await prisma.sellListing.update({ where: { id }, data });
  return ok({ listing: updated });
});

// Remove a listing. Body: { id }. Keeps it if there are linked orders (sets INACTIVE).
export const DELETE = withUser(async (user, request) => {
  const { id } = await readJson(request);
  if (!id) return fail("id wajib diisi");

  const listing = await prisma.sellListing.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  });
  if (!listing || listing.userId !== user.id) return fail("Listing tidak ditemukan", 404);

  if (listing._count.orders > 0) {
    await prisma.sellListing.update({ where: { id }, data: { status: "INACTIVE" } });
    return ok({ softDeleted: true });
  }
  await prisma.cartItem.deleteMany({ where: { listingId: id } });
  await prisma.bid.deleteMany({ where: { listingId: id } });
  await prisma.sellListing.delete({ where: { id } });
  return ok({ deleted: true });
});
