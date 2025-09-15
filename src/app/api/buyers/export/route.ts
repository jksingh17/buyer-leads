// app/api/buyers/export/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** same header as import */
const HEADER = [
  "fullName",
  "email",
  "phone",
  "city",
  "propertyType",
  "bhk",
  "purpose",
  "budgetMin",
  "budgetMax",
  "timeline",
  "source",
  "notes",
  "tags",
  "status",
];

function toCSVRow(fields: (string | number | null | undefined)[]) {
  return fields
    .map((v) => {
      if (v == null) return "";
      const s = String(v);
      if (s.includes('"') || s.includes(",") || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    })
    .join(",");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = url.searchParams;

  // Build where same as page (supports city, propertyType, status, timeline, search)
  const where: any = {};
  const city = params.get("city");
  const propertyType = params.get("propertyType");
  const status = params.get("status");
  const timeline = params.get("timeline");
  const q = params.get("q");

  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.buyers.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  const lines = [HEADER.join(",")];
  for (const r of rows) {
    lines.push(
      toCSVRow([
        r.fullName,
        r.email ?? "",
        r.phone,
        r.city,
        r.propertyType,
        r.bhk ?? "",
        r.purpose,
        r.budgetMin ?? "",
        r.budgetMax ?? "",
        r.timeline,
        r.source,
        r.notes ?? "",
        (r.tags || []).join(","),
        r.status,
      ])
    );
  }

  const csv = lines.join("\r\n");

  const res = new NextResponse(csv, { status: 200 });
  res.headers.set("Content-Type", "text/csv; charset=utf-8");
  res.headers.set("Content-Disposition", `attachment; filename="buyers-export.csv"`);
  return res;
}
