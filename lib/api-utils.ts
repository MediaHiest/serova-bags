import { NextResponse } from "next/server";
import { getAdminFromCookie, getUserFromCookie } from "./auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function requireUser() {
  const user = await getUserFromCookie();
  if (!user) {
    return { error: jsonError("Unauthorized", 401), user: null };
  }
  return { error: null, user };
}

export async function requireAdmin() {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return { error: jsonError("Unauthorized", 401), admin: null };
  }
  return { error: null, admin };
}
