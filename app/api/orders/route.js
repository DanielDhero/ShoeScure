import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, withUser } from "@/lib/api";
import { randomRef } from "@/lib/format";

const SHIPPING = 30000;

export const GET = withUser(async (user) => {
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { product: { include: { brand: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok({ orders });
});

// Create order(s).
// Single buy: { productId, size, note }
// Cart checkout: { fromCart: true, note }
export const POST = withUser(async (user, request) => {
  const body = await readJson(request);
  const note = body.note || null;

  let lineItems = [];

  if (body.fromCart) {
    const cart = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });
    if (cart.length === 0) return fail("Keranjang kosong");
    lineItems = cart.flatMap((c) =>
      Array.from({ length: c.quantity }, () => ({
        productId: c.productId,
        size: c.size,
        price: c.product.price,
      }))
    );
  } else {
    const { productId, size } = body;
    if (!productId || !size) return fail("productId dan size wajib diisi");
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return fail("Produk tidak ditemukan", 404);
    lineItems = [{ productId, size: Number(size), price: product.price }];
  }

  const ref = randomRef("INV");
  const created = await prisma.$transaction(async (tx) => {
    const orders = [];
    for (const li of lineItems) {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          productId: li.productId,
          size: li.size,
          price: li.price,
          shipping: SHIPPING,
          total: li.price + SHIPPING,
          note,
          ref,
        },
      });
      orders.push(order);
    }
    if (body.fromCart) {
      await tx.cartItem.deleteMany({ where: { userId: user.id } });
    }
    return orders;
  });

  const total = created.reduce((sum, o) => sum + o.total, 0);
  return ok({ orders: created, total, ref });
});
