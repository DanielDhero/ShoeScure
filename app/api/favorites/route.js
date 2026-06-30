import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, withUser } from "@/lib/api";

export const GET = withUser(async (user) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { product: { include: { brand: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok({ favorites: favorites.map((f) => f.product) });
});

// Toggle a favorite. Body: { productId }
export const POST = withUser(async (user, request) => {
  const { productId } = await readJson(request);
  if (!productId) return fail("productId wajib diisi");

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return ok({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId: user.id, productId } });
  return ok({ favorited: true });
});
