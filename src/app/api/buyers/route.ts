// src/app/api/buyers/route.ts
import { NextResponse } from "next/server";
import { buyerCreateValidated } from "@/lib/buyer-schemas";
import { prisma } from "@/lib/prisma";
import { requireUserServer } from "@/lib/auth";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const createRate = new Map<string, { count: number; firstAt: number }>();

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUserServer();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const entry = createRate.get(user.id) ?? { count: 0, firstAt: now };
  if (now - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.firstAt = now;
  }
  entry.count++;
  createRate.set(user.id, entry);
  if (entry.count > RATE_LIMIT_MAX) {
    return NextResponse.json({ ok: false, error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = buyerCreateValidated.parse(body);

    const created = await prisma.$transaction(async (tx) => {
      const b = await tx.buyers.create({
        data: {
          fullName: parsed.fullName,
          email: parsed.email ?? null,
          phone: parsed.phone,
          city: parsed.city,
          propertyType: parsed.propertyType,
          bhk: parsed.bhk ?? null,
          purpose: parsed.purpose,
          budgetMin: parsed.budgetMin ?? null,
          budgetMax: parsed.budgetMax ?? null,
          timeline: parsed.timeline,
          source: parsed.source,
          status: parsed.status ?? "NEW",
          notes: parsed.notes ?? null,
          tags: parsed.tags ?? [],
          ownerId: user.id,
        },
      });

      await tx.buyer_history.create({
        data: {
          buyerId: b.id,
          changedBy: user.id,
          diff: { created: b },
        },
      });

      return b;
    });

    return NextResponse.json({ ok: true, buyer: created }, { status: 201 });
  } catch (err: any) {
    console.error("create buyer error:", err);
    if (err?.name === "ZodError" || err?.issues) {
      return NextResponse.json({ ok: false, error: "Validation error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function GET() {
  const counts = await prisma.buyers.groupBy({
    by: ["city"],
    _count: { city: true },
  });

  return NextResponse.json({ ok: true, counts });
}
