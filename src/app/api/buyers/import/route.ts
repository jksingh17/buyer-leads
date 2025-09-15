// app/api/buyers/import/route.ts
import { NextResponse } from "next/server";
import { csvRowSchema, buyerCreateValidated } from "@/lib/buyer-schemas";
import { prisma } from "@/lib/prisma";
import { requireUserServer } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

/**
 * Very small CSV parser (handles quoted fields, commas).
 * Not a full featured CSV lib; good enough for simple imports.
 */
function parseCSV(text: string) {
  const rows: string[][] = [];
  let cur: string = "";
  let inQuotes = false;
  let row: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (cur !== "" || row.length > 0) {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      }
      // eat following \n if \r\n
      if (ch === "\r" && text[i + 1] === "\n") i++;
      continue;
    }
    cur += ch;
  }
  if (cur !== "" || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

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

export async function POST(req: Request) {
  const user = await requireUserServer();

  // Expect multipart/form-data with file field 'file'
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ ok: false, error: "Expected multipart/form-data with CSV file (field 'file')" }, { status: 400 });
  }

  const form = await req.formData();
  const f = form.get("file") as File | null;
  if (!f) {
    return NextResponse.json({ ok: false, error: "Missing file field 'file'" }, { status: 400 });
  }

  const text = await f.text();
  const parsedRows = parseCSV(text);
  if (!parsedRows || parsedRows.length === 0) {
    return NextResponse.json({ ok: false, error: "Empty CSV" }, { status: 400 });
  }

  // first row must match header
  const headerRow = parsedRows[0].map((h) => h.trim());
  if (headerRow.length !== HEADER.length || !HEADER.every((h, i) => headerRow[i].toLowerCase() === h.toLowerCase())) {
    return NextResponse.json({ ok: false, error: `CSV header mismatch. Expect: ${HEADER.join(",")}` }, { status: 400 });
  }

  const bodyRows = parsedRows.slice(1);
  if (bodyRows.length > 200) {
    return NextResponse.json({ ok: false, error: "CSV row limit exceeded (max 200)" }, { status: 400 });
  }

  const rowErrors: Array<{ row: number; message: string }> = [];
  const validCreates: any[] = [];

  for (let i = 0; i < bodyRows.length; i++) {
    const row = bodyRows[i];
    const obj: any = {};
    HEADER.forEach((h, idx) => {
      obj[h] = row[idx] !== undefined ? row[idx].trim() : "";
    });

    const parsed = csvRowSchema.safeParse(obj);
    if (!parsed.success) {
      rowErrors.push({ row: i + 2, message: "CSV parse error: " + JSON.stringify(parsed.error.issues) });
      continue;
    }

    // map CSV strings to typed fields expected by buyerCreateValidated
    const mapped: any = {
      fullName: obj.fullName,
      email: obj.email || null,
      phone: obj.phone,
      city: obj.city.toUpperCase(),
      propertyType: obj.propertyType.toUpperCase(),
      bhk: obj.bhk ? obj.bhk.toUpperCase() : null,
      purpose: obj.purpose.toUpperCase(),
      budgetMin: obj.budgetMin ? parseInt(obj.budgetMin, 10) : null,
      budgetMax: obj.budgetMax ? parseInt(obj.budgetMax, 10) : null,
      timeline: obj.timeline.toUpperCase(),
      source: obj.source.toUpperCase(),
      notes: obj.notes || null,
      tags: obj.tags ? obj.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      status: obj.status ? obj.status.toUpperCase() : undefined,
    };

    const validated = buyerCreateValidated.safeParse(mapped);
    if (!validated.success) {
      rowErrors.push({ row: i + 2, message: "Validation: " + JSON.stringify(validated.error.issues) });
      continue;
    }

    validCreates.push(validated.data);
  }

  // Insert valid rows in a transaction, return errors otherwise
  let inserted = 0;
  try {
    if (validCreates.length > 0) {
      const ops = validCreates.map((d) =>
        prisma.buyers.create({
          data: {
            fullName: d.fullName,
            email: d.email ?? null,
            phone: d.phone,
            city: d.city,
            propertyType: d.propertyType,
            bhk: d.bhk ?? null,
            purpose: d.purpose,
            budgetMin: d.budgetMin ?? null,
            budgetMax: d.budgetMax ?? null,
            timeline: d.timeline,
            source: d.source,
            notes: d.notes ?? null,
            tags: d.tags ?? [],
            status: d.status ?? "NEW",
            ownerId: user.id,
          },
        })
      );

    
     
      const createdRows = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const created: any[] = [];
        for (const op of ops) {
          const b = await op;
          // record history
          await tx.buyer_history.create({
            data: {
              buyerId: b.id,
              changedBy: user.id,
              diff: { created: b },
            },
          });
          created.push(b);
        }
        return created;
      });

      inserted = createdRows.length;
    }
  } catch (e: any) {
    console.error("CSV insert error:", e);
    return NextResponse.json({ ok: false, error: "DB insert error", details: String(e) }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted, errors: rowErrors });
}
