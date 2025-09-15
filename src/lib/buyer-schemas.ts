// lib/buyer-schemas.ts
import { z } from "zod";

export const CityEnum = z.enum(["CHANDIGARH", "MOHALI", "ZIRAKPUR", "PANCHKULA", "OTHER"]);
export const PropertyTypeEnum = z.enum(["APARTMENT", "VILLA", "PLOT", "OFFICE", "RETAIL"]);
export const BHKEnum = z.enum(["STUDIO", "ONE", "TWO", "THREE", "FOUR"]);
export const PurposeEnum = z.enum(["BUY", "RENT"]);
export const SourceEnum = z.enum(["WEBSITE", "REFERRAL", "WALK_IN", "CALL", "OTHER"]);
export const StatusEnum = z.enum(["NEW", "QUALIFIED", "CONTACTED", "VISITED", "NEGOTIATION", "CONVERTED", "DROPPED"]);
export const TimelineEnum = z.enum(["ZERO_TO_THREE", "THREE_TO_SIX", "MORE_THAN_SIX", "EXPLORING"]);

export const buyerCreateSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().nullable(),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Phone must be 10-15 digits"),
  city: CityEnum,
  propertyType: PropertyTypeEnum,
  bhk: z.union([BHKEnum, z.null()]).optional(),
  purpose: PurposeEnum,
  budgetMin: z.number().int().nonnegative().optional().nullable(),
  budgetMax: z.number().int().nonnegative().optional().nullable(),
  timeline: TimelineEnum,
  source: SourceEnum,
  notes: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  status: StatusEnum.optional().default("NEW"),
});

// Refinements
export const buyerCreateValidated = buyerCreateSchema.refine(
  (data) => {
    // bhk required for apartment or villa
    if (data.propertyType === "APARTMENT" || data.propertyType === "VILLA") {
      return !!data.bhk;
    }
    return true;
  },
  { message: "bhk is required for Apartment or Villa", path: ["bhk"] }
).refine(
  (data) => {
    if (data.budgetMin != null && data.budgetMax != null) {
      return data.budgetMax >= data.budgetMin;
    }
    return true;
  },
  { message: "budgetMax must be >= budgetMin", path: ["budgetMax"] }
);

/** CSV row schema (strings) — we parse numeric fields later */
export const csvRowSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().optional().nullable(),
  phone: z.string(),
  city: z.string(),
  propertyType: z.string(),
  bhk: z.string().optional().nullable(),
  purpose: z.string(),
  budgetMin: z.string().optional().nullable(),
  budgetMax: z.string().optional().nullable(),
  timeline: z.string(),
  source: z.string(),
  notes: z.string().optional().nullable(),
  tags: z.string().optional().nullable(), // comma-separated
  status: z.string().optional(),
});
