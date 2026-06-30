import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ok, fail, readJson, withUser } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  return ok({ user: user || null });
}

// Update profile. Body: { name?, phone?, address? }
export const PUT = withUser(async (user, request) => {
  const { name, phone, address } = await readJson(request);
  const data = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof phone === "string") data.phone = phone.trim() || null;
  if (typeof address === "string") data.address = address.trim() || null;
  if (Object.keys(data).length === 0) return fail("Tidak ada data untuk diperbarui");

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  const { passwordHash, ...safe } = updated;
  return ok({ user: safe });
});
