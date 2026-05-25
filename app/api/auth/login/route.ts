import { NextRequest } from "next/server";
import {
  createUserToken,
  setUserTokenCookie,
  verifyPassword,
} from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return jsonError("Invalid email or password", 401);
    }

    const token = await createUserToken({ userId: user.id, email: user.email });
    await setUserTokenCookie(token);

    return jsonSuccess({
      user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone },
    });
  } catch {
    return jsonError("Login failed", 500);
  }
}
