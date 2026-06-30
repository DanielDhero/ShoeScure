import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/api";
import { validatePassword } from "@/lib/validation";

export async function POST(request) {
  const { name, email, password } = await readJson(request);

  if (!name || !email || !password) {
    return fail("Nama, email, dan password wajib diisi");
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return fail(passwordError);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return fail("Email sudah terdaftar");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
    },
  });

  await createSession(user.id);
  const { passwordHash, ...safe } = user;
  return ok({ user: safe });
}
