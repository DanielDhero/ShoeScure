// Production seed — HANYA katalog master (brand + produk).
// TIDAK membuat akun demo, listing, order, atau transaksi apa pun.
// Listing & data transaksi datang dari user asli setelah live.
//
// Jalankan SEKALI saat setup database produksi:
//   node prisma/seed-prod.mjs
// Aman diulang (upsert by slug) untuk memperbarui katalog.

import { PrismaClient } from "@prisma/client";
import { seedCatalog, BRANDS, PRODUCTS } from "./seed.mjs";

const prisma = new PrismaClient();

async function main() {
  await seedCatalog(prisma);
  console.log(
    `Seed produksi selesai: ${BRANDS.length} brand, ${PRODUCTS.length} produk. ` +
      `Tidak ada akun/listing demo dibuat.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
