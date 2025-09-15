// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyQuerySchema } from '@/lib/zod-schemas';
import { signSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token') || '';
    const email = url.searchParams.get('email') || '';

    const parsed = verifyQuerySchema.parse({ token, email });
    const identifier = parsed.email.toLowerCase();

    // find verification token
    const vt = await prisma.verificationToken.findUnique({
      where: { token: parsed.token },
    });

    if (!vt || vt.identifier.toLowerCase() !== identifier) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if (vt.expires < new Date()) {
      // cleanup
      await prisma.verificationToken.deleteMany({ where: { token: parsed.token } });
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    // find or create user
    const user = await prisma.users.upsert({
      where: { email: identifier },
      create: {
        email: identifier,
        name: null,
      },
      update: {}, // no update
    });

    // create JWT and set cookie
    const jwt = signSession({ userId: user.id, email: user.email }, { expiresIn: '7d' });

    // remove verification token (single-use)
    await prisma.verificationToken.deleteMany({ where: { token: parsed.token } });

    const response = NextResponse.redirect(new URL('/', req.url)); // change target as needed
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: jwt,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    console.error('verify error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
