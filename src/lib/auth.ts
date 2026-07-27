import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "ls_admin_session";

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "livia-sodre-premium-secret-change-me",
  );
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as { role: string };
  } catch {
    return null;
  }
}

export function validateCredentials(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "livia2026";
  return password === expected;
}
