import { NextRequest } from "next/server";
import {
  createUserToken,
  hashPassword,
  setUserTokenCookie,
  verifyPassword,
  clearUserTokenCookie,
  getUserFromCookie,
} from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const { fullName, email, password, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("Email already registered", 409);
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        phone,
        profile: { create: {} },
        cart: { create: {} },
      },
    });

    const token = await createUserToken({ userId: user.id, email: user.email });
    await setUserTokenCookie(token);

    return jsonSuccess(
      {
        user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone },
      },
      201
    );
  } catch {
    return jsonError("Registration failed", 500);
  }
}
