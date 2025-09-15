// lib/zod-schemas.ts
import { z } from 'zod';

export const magicLinkRequestSchema = z.object({
  email: z.string().email(),
});

export const verifyQuerySchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
});
