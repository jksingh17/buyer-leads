// app/api/auth/demo/route.ts
import { NextResponse } from "next/server";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Dev / debug route for demo login.
 * - Checks DB connectivity
 * - Upserts demo user
 * - Signs JWT and sets cookie
 * - Returns full error stack on failure (dev only)
 */
export async function POST() {
  try {
    // quick DB connectivity check (will throw if DB unreachable)
    try {
      const n = await prisma.users.count();
      console.log(`[demo] prisma.users.count() -> ${n}`);
    } catch (dbErr) {
      console.error("[demo] Prisma connectivity/check failed:", dbErr);
      return NextResponse.json(
        { ok: false, error: "Prisma connectivity error", details: String(dbErr) },
        { status: 500 }
      );
    }

    const demoEmail = "demo@example.com";

    // upsert demo user
    let user;
    try {
      user = await prisma.users.upsert({
        where: { email: demoEmail },
        create: { email: demoEmail, name: "Demo User" },
        update: {},
      });
      console.log("[demo] upserted user:", user?.id);
    } catch (upsertErr) {
      console.error("[demo] upsert error:", upsertErr);
      return NextResponse.json(
        { ok: false, error: "Prisma upsert error", details: String(upsertErr) },
        { status: 500 }
      );
    }

    // create JWT
    let token: string;
    try {
      token = signSession({ userId: user.id, email: user.email });
    } catch (jwtErr) {
      console.error("[demo] signSession error:", jwtErr);
      return NextResponse.json(
        { ok: false, error: "JWT sign error", details: String(jwtErr) },
        { status: 500 }
      );
    }

    // success response + set cookie
    const res = NextResponse.json({ ok: true, user });
    try {
      res.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      console.log("[demo] set cookie success");
    } catch (cookieErr) {
      console.error("[demo] set-cookie error:", cookieErr);
      // still return user, but report cookie error
      return NextResponse.json(
        { ok: false, error: "Cookie set error", details: String(cookieErr) },
        { status: 500 }
      );
    }

    return res;
  } catch (err: unknown) {
  console.error("[demo] unexpected error:", err);

  if (err instanceof Error) {
    return NextResponse.json(
      { ok: false, error: err.message, stack: err.stack },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: false, error: "Unexpected error", stack: String(err) },
    { status: 500 }
  );
}

}
