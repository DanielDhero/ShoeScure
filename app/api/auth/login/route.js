import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/api";

export async function POST(request) {
  const { email, password } = await readJson(request);
  if (!email || !password) return fail("Email dan password wajib diisi");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return fail("Email atau password salah", 401);
  }

  await createSession(user.id);
  const { passwordHash, ...safe } = user;
  return ok({ user: safe });
}
