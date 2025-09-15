// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUserServer();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
