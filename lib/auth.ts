import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const USER_TOKEN_COOKIE = "serova_token";
const ADMIN_TOKEN_COOKIE = "serova_admin_token";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export interface UserTokenPayload {
  sub: string;
  email: string;
  type: "user";
}

export interface AdminTokenPayload {
  sub: string;
  email: string;
  type: "admin";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUserToken(payload: {
  userId: string;
  email: string;
}): Promise<string> {
  return new SignJWT({ email: payload.email, type: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function createAdminToken(email: string): Promise<string> {
  return new SignJWT({ email, type: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getJwtSecret());
}

export async function verifyUserToken(
  token: string
): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.type !== "user" || !payload.sub) return null;
    return {
      sub: payload.sub,
      email: payload.email as string,
      type: "user",
    };
  } catch {
    return null;
  }
}

export async function verifyAdminToken(
  token: string
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.type !== "admin") return null;
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      type: "admin",
    };
  } catch {
    return null;
  }
}

export async function setUserTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function setAdminTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearUserTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_TOKEN_COOKIE);
}

export async function clearAdminTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_TOKEN_COOKIE);
}

export async function getUserFromCookie(): Promise<UserTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

export async function getAdminFromCookie(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function validateAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("Admin credentials are not configured");
  }
  return email === adminEmail && password === adminPassword;
}

export { USER_TOKEN_COOKIE, ADMIN_TOKEN_COOKIE };
