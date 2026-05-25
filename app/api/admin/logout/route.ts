import { clearAdminTokenCookie } from "@/lib/auth";
import { jsonSuccess } from "@/lib/api-utils";

export async function POST() {
  await clearAdminTokenCookie();
  return jsonSuccess({ message: "Logged out" });
}
