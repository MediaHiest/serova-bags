import { clearUserTokenCookie } from "@/lib/auth";
import { jsonSuccess } from "@/lib/api-utils";

export async function POST() {
  await clearUserTokenCookie();
  return jsonSuccess({ message: "Logged out" });
}
