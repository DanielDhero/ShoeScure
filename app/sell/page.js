import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProducts } from "@/lib/queries";
import SellClient from "./SellClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Jual Sneaker — ShoeScure" };

export default async function SellPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/sell");

  const products = await getProducts();
  const catalog = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand?.name,
    image: p.image,
    price: p.price,
    sizes: JSON.parse(p.sizes || "[]"),
  }));

  return <SellClient catalog={catalog} preselectSlug={sp.product || null} />;
}
