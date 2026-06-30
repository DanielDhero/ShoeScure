// Aturan kekuatan password — dipakai bersama backend (API) & frontend (form).
// Syarat: minimal 8 karakter, ada huruf besar, huruf kecil, angka, dan karakter spesial.

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULE =
  "Password minimal 8 karakter dan mengandung huruf besar, huruf kecil, angka, serta karakter spesial.";

// Mengembalikan pesan error (string) jika tidak valid, atau null jika valid.
export function validatePassword(password) {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return PASSWORD_RULE;
  }
  if (!/[A-Z]/.test(password)) return PASSWORD_RULE;
  if (!/[a-z]/.test(password)) return PASSWORD_RULE;
  if (!/[0-9]/.test(password)) return PASSWORD_RULE;
  if (!/[^A-Za-z0-9]/.test(password)) return PASSWORD_RULE;
  return null;
}
