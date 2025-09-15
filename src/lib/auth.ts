// lib/auth.ts
import jwt, { SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SECRET: string = process.env.SECRET_COOKIE_PASSWORD || "dev-secret";
export const SESSION_COOKIE_NAME = "bl_session";

export type SessionPayload = {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
};

export function signSession(
  payload: SessionPayload,
  opts?: { expiresIn?: string | number }
) {
  const options: SignOptions = { expiresIn: (opts?.expiresIn ?? "7d") as SignOptions["expiresIn"] };
  return jwt.sign(payload, SECRET, options);
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

// server-only helper
export async function getCurrentUserServer() {
  const store = await cookies(); // only valid in route handler/server component
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifySession(token);
  if (!payload) return null;
  return prisma.users.findUnique({ where: { id: payload.userId } });
}

export async function requireUserServer() {
  const user = await getCurrentUserServer();
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  return user;
}
