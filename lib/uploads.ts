import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const PRODUCT_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function saveProductImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Invalid file type. Use JPEG, PNG, WebP, or GIF.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }

  await mkdir(PRODUCT_UPLOAD_DIR, { recursive: true });

  const ext = EXT_BY_TYPE[file.type] ?? ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const filepath = path.join(PRODUCT_UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);

  return `/uploads/products/${filename}`;
}
