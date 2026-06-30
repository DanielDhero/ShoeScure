import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHIPPING_FEE } from "@/lib/constants";
import { SNAP_SCRIPT_URL, publicClientKey, midtransConfigured } from "@/lib/midtrans";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout — ShoeScure" };

function lineFromListing(l) {
  const used = l.type === "USED";
  return {
    key: l.id,
    listingId: l.id,
    productId: l.productId,
    name: l.product.name,
    brand: l.product.brand?.name,
    image: used && l.image ? l.image : l.product.image,
    size: l.size,
    condition: l.condition,
    quantity: 1,
    price: l.price,
  };
}

export default async function CheckoutPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const source = sp.source === "cart" ? "cart" : "single";
  let lineItems = [];
  let single = null;

  if (source === "cart") {
    const cart = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { listing: { include: { product: { include: { brand: true } } } } },
      orderBy: { createdAt: "asc" },
    });
    const active = cart.filter((c) => c.listing && c.listing.status === "ACTIVE");
    if (active.length === 0) redirect("/cart");
    lineItems = active.map((c) => lineFromListing(c.listing));
  } else if (sp.bid) {
    // Checkout an accepted/countered bid at the negotiated price.
    const bid = await prisma.bid.findUnique({
      where: { id: sp.bid },
      include: { listing: { include: { product: { include: { brand: true } } } } },
    });
    if (!bid || bid.userId !== user.id || !["ACCEPTED", "COUNTERED"].includes(bid.status)) redirect("/account/bids");
    if (!bid.listing || bid.listing.status !== "ACTIVE") redirect("/account/bids");
    lineItems = [{ ...lineFromListing(bid.listing), price: bid.amount }];
    single = { bidId: bid.id };
  } else {
    const listingId = sp.listing;
    if (!listingId) redirect("/products");
    const listing = await prisma.sellListing.findUnique({
      where: { id: listingId },
      include: { product: { include: { brand: true } } },
    });
    if (!listing || listing.status !== "ACTIVE") redirect("/products");
    lineItems = [lineFromListing(listing)];
    single = { listingId: listing.id };
  }

  const subtotal = lineItems.reduce((s, li) => s + li.price * li.quantity, 0);

  const userInfo = {
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
  };

  return (
    <CheckoutClient
      mode={source}
      lineItems={lineItems}
      subtotal={subtotal}
      shipping={SHIPPING_FEE}
      single={single}
      user={userInfo}
      snapScriptUrl={SNAP_SCRIPT_URL}
      snapClientKey={publicClientKey}
      paymentReady={midtransConfigured()}
    />
  );
}
