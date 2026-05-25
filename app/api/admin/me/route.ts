import { getAdminFromCookie } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-utils";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return jsonError("Not authenticated", 401);
  return jsonSuccess({ admin: { email: admin.email } });
}
