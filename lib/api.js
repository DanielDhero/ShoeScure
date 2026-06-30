import { getCurrentUser } from "./auth";

export function ok(data, init) {
  return Response.json(data, init);
}

export function fail(message, status = 400) {
  return Response.json({ error: message }, { status });
}

// Wraps a handler that needs an authenticated user.
// handler signature: (user, request, ctx) => Response
export function withUser(handler) {
  return async (request, ctx) => {
    try {
      const user = await getCurrentUser();
      if (!user) return fail("Silakan login terlebih dahulu", 401);
      return await handler(user, request, ctx);
    } catch (e) {
      console.error(e);
      return fail(e.message || "Terjadi kesalahan", e.status || 500);
    }
  };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
