import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, withUser } from "@/lib/api";
import { randomRef } from "@/lib/format";
import { REPAIR_SERVICES, SERVICE_BUNDLES } from "@/lib/constants";
import { createSnapTransaction, midtransConfigured } from "@/lib/midtrans";

export const GET = withUser(async (user) => {
  const repairs = await prisma.repairRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return ok({ repairs });
});

// Submit a repair request (à la carte services or a bundle) + create a Midtrans bill.
// Body: { services: [id], bundleId?, productName, images: [url], note }
export const POST = withUser(async (user, request) => {
  const { services, bundleId, productName, images, note } = await readJson(request);
  if (!productName) return fail("Nama produk wajib diisi");
  if (!Array.isArray(images) || images.length === 0) return fail("Wajib upload foto sepatu");

  if (!midtransConfigured()) {
    return fail("Payment gateway belum dikonfigurasi. Set MIDTRANS_SERVER_KEY di .env", 503);
  }

  let price = 0;
  let summary = "";
  let servicesJson = null;

  if (bundleId) {
    const b = SERVICE_BUNDLES.find((x) => x.id === bundleId);
    if (!b) return fail("Paket tidak valid");
    price = b.price;
    summary = b.name;
    servicesJson = JSON.stringify([bundleId]);
  } else {
    const ids = Array.isArray(services) ? services : [];
    const chosen = REPAIR_SERVICES.filter((s) => ids.includes(s.id));
    if (chosen.length === 0) return fail("Pilih minimal satu layanan");
    price = chosen.reduce((s, x) => s + x.price, 0);
    summary = chosen.map((x) => x.name).join(" + ");
    servicesJson = JSON.stringify(ids);
  }

  const ref = randomRef("RP");
  const repair = await prisma.repairRequest.create({
    data: {
      userId: user.id,
      service: summary,
      services: servicesJson,
      productName,
      images: JSON.stringify(images),
      note: note || null,
      price,
      status: "In Progress",
      paymentStatus: "PENDING",
      certNo: ref,
      ref,
    },
  });

  try {
    const tx = await createSnapTransaction({
      ref,
      grossAmount: price,
      items: [{ id: "REPAIR", price, quantity: 1, name: `Repair: ${summary}`.slice(0, 50) }],
      user,
      origin: request.nextUrl.origin,
    });
    await prisma.repairRequest.update({ where: { id: repair.id }, data: { snapToken: tx.token } });
    return ok({ repair, token: tx.token, ref, total: price });
  } catch (e) {
    await prisma.repairRequest.delete({ where: { id: repair.id } });
    return fail(e.message || "Gagal membuat transaksi", 502);
  }
});
