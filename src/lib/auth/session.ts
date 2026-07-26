import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "mitoonito_session";

export type SessionPayload = {
  sub: string; // userId
  email: string;
  plan: "FREE" | "PREMIUM";
};

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or too short (need at least 32 characters).",
    );
  }
  return new TextEncoder().encode(secret);
}

function getTtlSeconds() {
  const raw = process.env.SESSION_TTL_SECONDS ?? "604800";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 604800;
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<{ token: string; maxAge: number }> {
  const maxAge = getTtlSeconds();
  const token = await new SignJWT({
    email: payload.email,
    plan: payload.plan,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getSecretKey());

  return { token, maxAge };
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const sub = payload.sub;
    const email = payload.email;
    const plan = payload.plan;

    if (
      typeof sub !== "string" ||
      typeof email !== "string" ||
      (plan !== "FREE" && plan !== "PREMIUM")
    ) {
      return null;
    }

    return { sub, email, plan };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string, maxAge: number) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
