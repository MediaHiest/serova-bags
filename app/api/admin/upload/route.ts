import { NextRequest } from "next/server";
import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-utils";
import { saveProductImage } from "@/lib/uploads";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return jsonError("No file provided", 400);
  }

  try {
    const url = await saveProductImage(file);
    return jsonSuccess({ url }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return jsonError(message, 400);
  }
}
