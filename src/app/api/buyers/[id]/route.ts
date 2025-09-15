// src/app/api/buyers/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buyerCreateSchema } from "@/lib/buyer-schemas";
import { requireUserServer } from "@/lib/auth";

/**
 * PATCH /api/buyers/:id
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  // auth
  let user: any;
  try {
    user = await requireUserServer();
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = buyerCreateSchema.parse(body);

    // find existing
    const current = await prisma.buyers.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    // ownership check (allow admin)
    const isAdmin = (user.role ?? "USER") === "ADMIN";
    if (current.ownerId !== user.id && !isAdmin) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // concurrency check if client provided token
    if (body.updatedAt) {
      const prev = new Date(body.updatedAt).getTime();
      const curr = new Date(current.updatedAt).getTime();
      if (prev !== curr) {
        return NextResponse.json(
          { ok: false, message: "Record changed on server. Please refresh.", currentUpdatedAt: current.updatedAt },
          { status: 409 }
        );
      }
    }

    const updateData: any = {
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
      notes: parsed.notes ?? null,
      tags: parsed.tags ?? [],
      status: parsed.status ?? current.status,
    };

    // update + history transaction
    const updated = await prisma.$transaction(async (tx) => {
      const after = await tx.buyers.update({ where: { id }, data: updateData });

      await tx.buyer_history.create({
        data: {
          buyerId: after.id,
          changedBy: user.id,
          diff: { before: current, after },
        },
      });

      return after;
    });

    return NextResponse.json({ ok: true, buyer: updated }, { status: 200 });
  } catch (err: any) {
    if (err?.name === "ZodError" || err?.issues) {
      return NextResponse.json({ ok: false, error: "Validation error", details: err }, { status: 400 });
    }
    console.error("PATCH /api/buyers/[id] error:", err);
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
