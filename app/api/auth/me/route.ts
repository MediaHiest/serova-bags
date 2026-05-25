import { getUserFromCookie } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getUserFromCookie();
  if (!session) {
    return jsonError("Not authenticated", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, fullName: true, email: true, phone: true, createdAt: true },
  });

  if (!user) {
    return jsonError("User not found", 404);
  }

  return jsonSuccess({ user });
}
