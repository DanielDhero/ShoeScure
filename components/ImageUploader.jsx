"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const configured = Boolean(CLOUD && PRESET);

// Reusable photo uploader backed by the Cloudinary Upload Widget.
// Sources: device, camera, Google Drive, Dropbox, URL. Controlled via `value` (array of URLs).
export default function ImageUploader({ value = [], onChange, max = 1, label }) {
  const widgetRef = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!configured) return;
    if (window.cloudinary) {
      setReady(true);
      return;
    }
    const existing = document.getElementById("cloudinary-widget");
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      return;
    }
    const s = document.createElement("script");
    s.id = "cloudinary-widget";
    s.src = "https://upload-widget.cloudinary.com/global/all.js";
    s.async = true;
    s.onload = () => setReady(true);
    document.body.appendChild(s);
  }, []);

  const open = useCallback(() => {
    if (!ready || !window.cloudinary) return;
    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD,
          uploadPreset: PRESET,
          sources: ["local", "camera", "google_drive", "dropbox", "url"],
          multiple: max > 1,
          maxFiles: max,
          folder: "shoescure",
          clientAllowedFormats: ["image"],
          maxImageFileSize: 5_000_000,
        },
        (error, result) => {
          if (!error && result?.event === "success") {
            const url = result.info.secure_url;
            const next = [...valueRef.current, url].slice(0, max);
            onChange(next);
          }
        }
      );
    }
    widgetRef.current.open();
  }, [ready, max, onChange]);

  const removeAt = (url) => onChange(value.filter((u) => u !== url));

  return (
    <div>
      {label && <p className="mb-2 text-sm font-semibold text-ink">{label}</p>}

      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-line bg-cloud">
            <Image src={url} alt="Foto" fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => removeAt(url)}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white hover:bg-black"
              aria-label="Hapus foto"
            >
              ✕
            </button>
          </div>
        ))}

        {value.length < max && (
          configured ? (
            <button
              type="button"
              onClick={open}
              disabled={!ready}
              className="grid h-24 w-24 place-items-center rounded-lg border-2 border-dashed border-line text-center text-xs text-muted transition-colors hover:border-mint-dark disabled:opacity-50"
            >
              {ready ? "📷 Tambah Foto" : "Memuat..."}
            </button>
          ) : (
            <div className="grid h-24 w-40 place-items-center rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 px-2 text-center text-[11px] text-amber-700">
              Upload belum aktif — set NEXT_PUBLIC_CLOUDINARY_* di .env
            </div>
          )
        )}
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Dari device, kamera, Google Drive, atau Dropbox · maks {max} foto · 5MB/foto
      </p>
    </div>
  );
}
