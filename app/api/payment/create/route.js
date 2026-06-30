import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, withUser } from "@/lib/api";
import { randomRef } from "@/lib/format";
import { SHIPPING_FEE } from "@/lib/constants";
import { snap, midtransConfigured } from "@/lib/midtrans";

// Create PENDING order(s) for seller listings + request a Midtrans Snap token.
// Single buy:    { listingId, note }
// Cart checkout: { fromCart: true, note }
export const POST = withUser(async (user, request) => {
  if (!midtransConfigured()) {
    return fail("Payment gateway belum dikonfigurasi. Set MIDTRANS_SERVER_KEY di .env", 503);
  }

  const body = await readJson(request);
  const note = body.note || null;

  // Resolve the units being purchased: { listing, price }.
  // price may differ from listing.price when buying via an accepted bid.
  let units = [];
  if (body.fromCart) {
    const cart = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { listing: { include: { product: true } } },
    });
    units = cart.filter((c) => c.listing).map((c) => ({ listing: c.listing, price: c.listing.price }));
  } else if (body.bidId) {
    const bid = await prisma.bid.findUnique({
      where: { id: body.bidId },
      include: { listing: { include: { product: true } } },
    });
    if (!bid || bid.userId !== user.id) return fail("Tawaran tidak ditemukan", 404);
    if (!["ACCEPTED", "COUNTERED"].includes(bid.status)) return fail("Tawaran belum disetujui penjual");
    if (bid.listing) units = [{ listing: bid.listing, price: bid.amount }];
  } else {
    if (!body.listingId) return fail("listingId wajib diisi");
    const l = await prisma.sellListing.findUnique({ where: { id: body.listingId }, include: { product: true } });
    if (l) units = [{ listing: l, price: l.price }];
  }

  // Validate availability & ownership.
  units = units.filter((u) => u.listing && u.listing.status === "ACTIVE");
  if (units.length === 0) return fail("Tidak ada barang yang bisa dibeli (mungkin sudah terjual)");
  if (units.some((u) => u.listing.userId === user.id)) {
    return fail("Tidak bisa membeli barangmu sendiri");
  }

  const subtotal = units.reduce((s, u) => s + u.price, 0);
  const grossAmount = subtotal + SHIPPING_FEE;
  const ref = randomRef("INV");

  // Persist PENDING orders. Shipping charged once (first row) so sum(total) == gross.
  await prisma.$transaction(
    units.map((u, i) =>
      prisma.order.create({
        data: {
          userId: user.id,
          productId: u.listing.productId,
          listingId: u.listing.id,
          size: u.listing.size,
          price: u.price,
          type: u.listing.type,
          condition: u.listing.condition,
          shipping: i === 0 ? SHIPPING_FEE : 0,
          total: i === 0 ? u.price + SHIPPING_FEE : u.price,
          status: "PENDING",
          note,
          ref,
        },
      })
    )
  );

  // Snap parameters. gross_amount MUST equal sum(item_details).
  const itemDetails = units.map((u) => ({
    id: u.listing.id,
    price: u.price,
    quantity: 1,
    name: `${u.listing.product.name} (${u.listing.type})`.slice(0, 50),
  }));
  itemDetails.push({ id: "SHIPPING", price: SHIPPING_FEE, quantity: 1, name: "Ongkos Kirim" });

  const [firstName, ...rest] = (user.name || "Pelanggan").split(" ");
  const parameter = {
    transaction_details: { order_id: ref, gross_amount: grossAmount },
    item_details: itemDetails,
    customer_details: {
      first_name: firstName,
      last_name: rest.join(" ") || undefined,
      email: user.email,
      phone: user.phone || undefined,
    },
    callbacks: { finish: `${request.nextUrl.origin}/payment-success?ref=${ref}` },
  };

  try {
    const tx = await snap.createTransaction(parameter);
    await prisma.order.updateMany({ where: { ref, userId: user.id }, data: { snapToken: tx.token } });
    return ok({ token: tx.token, redirectUrl: tx.redirect_url, ref, total: grossAmount });
  } catch (e) {
    await prisma.order.deleteMany({ where: { ref, userId: user.id } });
    const msg = e?.ApiResponse?.error_messages?.join(", ") || e.message || "Gagal membuat transaksi";
    return fail(msg, 502);
  }
});
