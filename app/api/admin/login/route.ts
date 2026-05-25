import { NextRequest } from "next/server";
import {
  createAdminToken,
  setAdminTokenCookie,
  validateAdminCredentials,
  clearAdminTokenCookie,
  getAdminFromCookie,
} from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-utils";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const { email, password } = parsed.data;
    if (!validateAdminCredentials(email, password)) {
      return jsonError("Invalid admin credentials", 401);
    }

    const token = await createAdminToken(email);
    await setAdminTokenCookie(token);

    return jsonSuccess({ admin: { email } });
  } catch {
    return jsonError("Admin login failed", 500);
  }
}
