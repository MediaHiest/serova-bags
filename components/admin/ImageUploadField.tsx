"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  onUploadStateChange?: (uploading: boolean) => void;
  onError?: (message: string) => void;
  label?: string;
}

export default function ImageUploadField({
  value,
  onChange,
  onUploadStateChange,
  onError,
  label = "Image",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    onUploadStateChange?.(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      onChange(data.url);
      setPreview(null);
    } catch (err) {
      setPreview(null);
      onError?.(err instanceof Error ? err.message : "Upload failed");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setUploading(false);
      onUploadStateChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const displaySrc = preview || value;

  return (
    <div className="space-y-2">
      <label className="input-label">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={uploading}
        className="input-field text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-text-dark/5 file:text-text-dark hover:file:bg-text-dark/10"
      />
      <p className="text-[11px] text-text-muted">JPEG, PNG, WebP, or GIF · max 5MB</p>
      {uploading && <p className="text-xs text-text-muted">Uploading…</p>}
      {displaySrc && !uploading && (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-bg-off-white border border-text-dark/10">
          <Image
            src={displaySrc}
            alt="Preview"
            fill
            className="object-cover"
            sizes="96px"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
