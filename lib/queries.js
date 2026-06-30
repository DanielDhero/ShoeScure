import { prisma } from "./prisma";

export async function getBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

// Raw master products (used by sell catalog selector & search).
export async function getProducts({ brand, q } = {}) {
  const where = {};
  if (brand && brand !== "all") where.brand = { slug: brand };
  if (q) {
    where.OR = [{ name: { contains: q } }, { brand: { name: { contains: q } } }];
  }
  return prisma.product.findMany({
    where,
    include: { brand: true },
    orderBy: { createdAt: "asc" },
  });
}

// Annotate a list of products with the real lowest ask from ACTIVE listings.
async function annotateLowest(products) {
  const ids = products.map((p) => p.id);
  const listings = await prisma.sellListing.findMany({
    where: { productId: { in: ids }, status: "ACTIVE" },
    select: { productId: true, price: true, type: true },
  });
  const min = {};
  const hasUsed = {};
  const hasBnib = {};
  for (const l of listings) {
    if (min[l.productId] == null || l.price < min[l.productId]) min[l.productId] = l.price;
    if (l.type === "USED") hasUsed[l.productId] = true;
    else hasBnib[l.productId] = true;
  }
  return products.map((p) => ({
    ...p,
    displayPrice: min[p.id] ?? p.price,
    hasListing: min[p.id] != null,
    hasUsed: !!hasUsed[p.id],
    hasBnib: !!hasBnib[p.id],
  }));
}

export async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true },
    include: { brand: true },
    orderBy: { createdAt: "asc" },
  });
  return annotateLowest(products);
}

// GOAT-style marketplace browse: products that actually have ACTIVE listings,
// aggregated in real time. Filters by condition type (BNIB/USED), size, brand, q.
export async function getMarketplaceProducts({ type = "all", size, brand, q } = {}) {
  const listings = await prisma.sellListing.findMany({
    where: { status: "ACTIVE" },
    include: { product: { include: { brand: true } } },
  });

  const map = new Map();
  for (const l of listings) {
    let e = map.get(l.productId);
    if (!e) {
      e = { product: l.product, bnib: [], used: [], bnibSizes: new Set(), usedSizes: new Set() };
      map.set(l.productId, e);
    }
    if (l.type === "USED") {
      e.used.push(l.price);
      e.usedSizes.add(l.size);
    } else {
      e.bnib.push(l.price);
      e.bnibSizes.add(l.size);
    }
  }

  let items = [...map.values()].map((e) => {
    const hasBnib = e.bnib.length > 0;
    const hasUsed = e.used.length > 0;
    return {
      ...e.product,
      hasBnib,
      hasUsed,
      bnibLowest: hasBnib ? Math.min(...e.bnib) : null,
      usedLowest: hasUsed ? Math.min(...e.used) : null,
      lowestAsk: Math.min(...e.bnib, ...e.used),
      listingCount: e.bnib.length + e.used.length,
      bnibSizes: [...e.bnibSizes].sort((a, b) => a - b),
      usedSizes: [...e.usedSizes].sort((a, b) => a - b),
    };
  });

  if (type === "BNIB") items = items.filter((i) => i.hasBnib);
  if (type === "USED") items = items.filter((i) => i.hasUsed);

  if (size) {
    const s = Number(size);
    items = items.filter((i) =>
      type === "USED"
        ? i.usedSizes.includes(s)
        : type === "BNIB"
        ? i.bnibSizes.includes(s)
        : i.bnibSizes.includes(s) || i.usedSizes.includes(s)
    );
  }
  if (brand && brand !== "all") items = items.filter((i) => i.brand?.slug === brand);
  if (q) {
    const qq = q.toLowerCase();
    items = items.filter(
      (i) => i.name.toLowerCase().includes(qq) || i.brand?.name.toLowerCase().includes(qq)
    );
  }

  // The price shown depends on which condition tab is active.
  items = items.map((i) => ({
    ...i,
    displayPrice: type === "USED" ? i.usedLowest : type === "BNIB" ? i.bnibLowest : i.lowestAsk,
  }));
  items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return items;
}

// All distinct sizes that currently have ACTIVE listings (for the size filter).
export async function getActiveSizes() {
  const rows = await prisma.sellListing.findMany({
    where: { status: "ACTIVE" },
    select: { size: true },
    distinct: ["size"],
    orderBy: { size: "asc" },
  });
  return rows.map((r) => r.size);
}

export async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true },
  });
  if (!product) return null;
  return { ...product, sizeList: JSON.parse(product.sizes || "[]") };
}

// Product detail with real-time availability per condition & size (GOAT-style).
export async function getProductMarket(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true },
  });
  if (!product) return null;

  const listings = await prisma.sellListing.findMany({
    where: { productId: product.id, status: "ACTIVE" },
    include: { user: { select: { name: true } } },
    orderBy: { price: "asc" },
  });

  const build = (t) => {
    const arr = listings.filter((l) => l.type === t);
    const bySize = {};
    for (const l of arr) {
      // listings are price-asc, so first per size is the cheapest.
      if (!bySize[l.size]) bySize[l.size] = l;
    }
    return {
      available: arr.length > 0,
      lowest: arr.length ? Math.min(...arr.map((x) => x.price)) : null,
      sizes: Object.keys(bySize).map(Number).sort((a, b) => a - b),
      bySize,
      listings: arr,
    };
  };

  return {
    product: { ...product, sizeList: JSON.parse(product.sizes || "[]") },
    bnib: build("BNIB"),
    used: build("USED"),
  };
}

export async function getRelatedProducts(product, take = 5) {
  const products = await prisma.product.findMany({
    where: { id: { not: product.id } },
    include: { brand: true },
    take,
    orderBy: { createdAt: "asc" },
  });
  return annotateLowest(products);
}

export async function getBanners() {
  const products = await prisma.product.findMany({
    where: { label: { not: null } },
    include: { brand: true },
    take: 3,
  });
  return products;
}
