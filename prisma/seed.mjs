import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const BRANDS = [
  { slug: "nike", name: "Nike" },
  { slug: "jordan", name: "Jordan" },
  { slug: "adidas", name: "Adidas" },
  { slug: "converse", name: "Converse" },
  { slug: "newbalance", name: "New Balance" },
  { slug: "puma", name: "Puma" },
  { slug: "reebok", name: "Reebok" },
];

export const PRODUCTS = [
  {
    slug: "nike-air-max-plus",
    name: "Nike Air Max Plus",
    brand: "nike",
    category: "Men's Shoes",
    price: 2500000,
    retailPrice: 2500000,
    releaseDate: "20 Maret 2020",
    color: "Blue / Black",
    gender: "Men",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    description:
      "Nike Air Max Plus debut tahun 1998 dan langsung populer. Desainnya terinspirasi pohon palem dan ombak laut, dengan upper gradasi khas serta bantalan Air yang terlihat.",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    featured: true,
    label: "Best Seller",
  },
  {
    slug: "air-jordan-spizike",
    name: "Air Jordan Spizike",
    brand: "jordan",
    category: "Men's Shoes",
    price: 2100000,
    retailPrice: 2100000,
    releaseDate: "15 Desember 2018",
    color: "Blue",
    gender: "Men",
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600",
    description:
      "Spizike memadukan elemen dari Air Jordan 3, 4, dan 6 menciptakan tampilan unik dan menarik, sering hadir dalam kombinasi warna berani.",
    sizes: [39, 40, 41, 42, 43],
    featured: true,
  },
  {
    slug: "adidas-ultraboost",
    name: "Adidas Ultraboost",
    brand: "adidas",
    category: "Men's Shoes",
    price: 2800000,
    retailPrice: 2800000,
    releaseDate: "10 Juni 2021",
    color: "Beige / Brown",
    gender: "Men",
    image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600",
    description:
      "Adidas Ultraboost dengan bantalan Boost responsif dan upper Primeknit+ untuk fit yang adaptif. Ikon di dunia lari maupun streetwear.",
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    featured: true,
  },
  {
    slug: "puma-speedcat-x-ferrari",
    name: "Puma Speedcat X Ferrari",
    brand: "puma",
    category: "Men's Shoes",
    price: 4500000,
    retailPrice: 4500000,
    releaseDate: "05 Januari 2022",
    color: "Red / White",
    gender: "Men",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600",
    description:
      "Kolaborasi Puma dan Ferrari, Speedcat X dengan siluet low-profile terinspirasi motorsport. Kulit premium dan branding ikonik Ferrari.",
    sizes: [39, 40, 41, 42, 43],
    featured: true,
  },
  {
    slug: "air-jordan-1-high",
    name: "Air Jordan 1 High",
    brand: "jordan",
    category: "Men's Shoes",
    price: 3200000,
    retailPrice: 3200000,
    releaseDate: "01 September 2023",
    color: "Blue / Black / White",
    gender: "Men",
    image: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600",
    description:
      "Air Jordan 1 High, salah satu sneaker paling ikonik sepanjang masa. Awalnya dirancang untuk Michael Jordan, siluet high-top dengan material premium.",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    featured: true,
    label: "New Release",
  },
  {
    slug: "nike-dunk-low-retro",
    name: "Nike Dunk Low Retro",
    brand: "nike",
    category: "Men's Shoes",
    price: 1800000,
    retailPrice: 1800000,
    releaseDate: "22 April 2023",
    color: "Green / White",
    gender: "Men",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600",
    description:
      "Nike Dunk Low Retro menghadirkan kembali sepatu basket klasik dalam bentuk aslinya. Colorway bersih dan fit nyaman menjadikannya staple streetwear.",
    sizes: [39, 40, 41, 42, 43, 44],
    featured: true,
  },
  {
    slug: "new-balance-550",
    name: "New Balance 550",
    brand: "newbalance",
    category: "Men's Shoes",
    price: 2300000,
    retailPrice: 2300000,
    releaseDate: "12 Februari 2022",
    color: "White / Green",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600",
    description:
      "New Balance 550 menghidupkan kembali siluet basket era 80-an dengan tampilan retro yang bersih dan serbaguna.",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    featured: true,
  },
  {
    slug: "converse-chuck-70-high",
    name: "Converse Chuck 70 High",
    brand: "converse",
    category: "Unisex Shoes",
    price: 1200000,
    retailPrice: 1200000,
    releaseDate: "08 Maret 2021",
    color: "Black / White",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600",
    description:
      "Chuck 70 adalah versi premium dari Chuck Taylor klasik, dengan kanvas lebih tebal, bantalan OrthoLite, dan detail vintage.",
    sizes: [37, 38, 39, 40, 41, 42, 43],
    featured: true,
  },
  {
    slug: "adidas-samba-og",
    name: "Adidas Samba OG",
    brand: "adidas",
    category: "Unisex Shoes",
    price: 1900000,
    retailPrice: 1900000,
    releaseDate: "19 Juli 2023",
    color: "Black / White / Gum",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600",
    description:
      "Adidas Samba OG, ikon abadi yang kini jadi favorit streetwear. Upper kulit, overlay suede, dan outsole gum klasik.",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    featured: true,
    label: "Best Seller",
  },
  {
    slug: "nike-air-force-1-low",
    name: "Nike Air Force 1 Low",
    brand: "nike",
    category: "Men's Shoes",
    price: 1600000,
    retailPrice: 1600000,
    releaseDate: "01 Januari 2022",
    color: "Triple White",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
    description:
      "Air Force 1 Low, sneaker legendaris dengan desain bersih serba putih yang cocok untuk gaya apa pun.",
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    featured: true,
  },
  {
    slug: "reebok-club-c-85",
    name: "Reebok Club C 85",
    brand: "reebok",
    category: "Unisex Shoes",
    price: 1100000,
    retailPrice: 1100000,
    releaseDate: "14 Mei 2021",
    color: "Chalk / Green",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600",
    description:
      "Reebok Club C 85, sneaker tenis minimalis era 80-an dengan upper kulit lembut dan profil bersih.",
    sizes: [39, 40, 41, 42, 43],
    featured: false,
  },
  {
    slug: "jordan-4-retro",
    name: "Air Jordan 4 Retro",
    brand: "jordan",
    category: "Men's Shoes",
    price: 3800000,
    retailPrice: 3800000,
    releaseDate: "27 Oktober 2023",
    color: "Black / Cement",
    gender: "Men",
    image: "https://images.unsplash.com/photo-1556048219-bb6978360b84?w=600",
    description:
      "Air Jordan 4 Retro dengan desain ikonik, panel mesh, dan dukungan sayap plastik. Salah satu siluet Jordan paling dicari.",
    sizes: [40, 41, 42, 43, 44],
    featured: true,
    label: "New Release",
  },
];

// Seed master catalog (brands + products) only. Idempotent (upsert by slug).
// Dipakai bersama oleh seed dev (seed.mjs) dan seed produksi (seed-prod.mjs).
export async function seedCatalog(prisma) {
  console.log("Seeding brands...");
  const brandMap = {};
  for (const b of BRANDS) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: b,
    });
    brandMap[b.slug] = brand.id;
  }

  console.log("Seeding products...");
  for (const p of PRODUCTS) {
    const data = {
      name: p.name,
      brandId: brandMap[p.brand],
      category: p.category,
      price: p.price,
      retailPrice: p.retailPrice,
      releaseDate: p.releaseDate,
      color: p.color,
      gender: p.gender,
      image: p.image,
      description: p.description,
      sizes: JSON.stringify(p.sizes),
      featured: p.featured,
      label: p.label ?? null,
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
  }

  return brandMap;
}

async function main() {
  await seedCatalog(prisma);

  console.log("Seeding demo user...");
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "demo@shoescure.com" },
    update: {},
    create: {
      name: "Daniel Dhero",
      email: "demo@shoescure.com",
      passwordHash,
      phone: "+62 812 3456 7890",
      address: "Jl. Garuda, Tengkerang Tengah, Marpoyan Damai, Pekanbaru, Riau, 28282",
      coinBalance: 1000,
    },
  });

  console.log("Seeding seller accounts...");
  const SELLERS = [
    { name: "Budi Santoso", email: "budi@shoescure.com" },
    { name: "Sari Putri", email: "sari@shoescure.com" },
    { name: "Andi Wijaya", email: "andi@shoescure.com" },
  ];
  const sellerIds = [];
  for (const s of SELLERS) {
    const u = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        passwordHash,
        phone: "0812 0000 0000",
        address: "Jakarta, Indonesia",
        coinBalance: 1000,
      },
    });
    sellerIds.push(u.id);
  }

  console.log("Resetting transactional data & seeding listings...");
  await prisma.bid.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.legitCheck.deleteMany();
  await prisma.repairRequest.deleteMany();
  await prisma.coinTransaction.deleteMany();
  await prisma.sellListing.deleteMany();

  const allProducts = await prisma.product.findMany();
  const USED_GRADES = ["VNDS", "Used - Good", "Used - Fair"];
  const listings = [];
  let seller = 0;
  for (const prod of allProducts) {
    const sizes = JSON.parse(prod.sizes);
    sizes.forEach((sz, idx) => {
      // BNIB on most sizes, with slight price variance to create a real "lowest ask".
      if (idx % 2 === 0 || idx === sizes.length - 1) {
        const price = Math.round((prod.price * (0.92 + ((idx % 3) * 0.05))) / 1000) * 1000;
        listings.push({
          userId: sellerIds[seller++ % sellerIds.length],
          productId: prod.id,
          size: sz,
          type: "BNIB",
          condition: "Brand New",
          price,
          image: null,
          status: "ACTIVE",
        });
      }
      // USED on a couple of sizes, cheaper, with a (placeholder) real photo.
      if (idx === 1 || idx === 3) {
        const price = Math.round((prod.price * (0.6 + ((idx % 3) * 0.06))) / 1000) * 1000;
        listings.push({
          userId: sellerIds[seller++ % sellerIds.length],
          productId: prod.id,
          size: sz,
          type: "USED",
          condition: USED_GRADES[idx % USED_GRADES.length],
          price,
          image: prod.image,
          status: "ACTIVE",
        });
      }
    });
  }
  await prisma.sellListing.createMany({ data: listings });

  console.log(`Seeded ${listings.length} listings from ${SELLERS.length} sellers.`);
  console.log("Seed complete. Demo login: demo@shoescure.com / password123");
}

// Hanya jalankan seed dev penuh saat file ini dieksekusi langsung
// (bukan saat di-import oleh seed-prod.mjs untuk memakai seedCatalog).
import { pathToFileURL } from "node:url";
const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
