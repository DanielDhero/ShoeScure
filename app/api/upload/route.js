import { ok, fail, withUser } from "@/lib/api";
import { cloudinary, cloudinaryConfigured } from "@/lib/cloudinary";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// Upload an image (used-product photo) to Cloudinary. multipart/form-data: file
export const POST = withUser(async (user, request) => {
  if (!cloudinaryConfigured()) {
    return fail("Upload foto belum dikonfigurasi. Set CLOUDINARY_* di .env", 503);
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return fail("File foto tidak ditemukan");
  if (!file.type?.startsWith("image/")) return fail("File harus berupa gambar");

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > MAX_BYTES) return fail("Ukuran foto maksimal 5MB");

  const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;
  try {
    const res = await cloudinary.uploader.upload(dataUri, {
      folder: "shoescure/listings",
      resource_type: "image",
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    });
    return ok({ url: res.secure_url });
  } catch (e) {
    return fail(e.message || "Gagal upload foto", 502);
  }
});
