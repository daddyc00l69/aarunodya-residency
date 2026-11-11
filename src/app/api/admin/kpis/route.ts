import { NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
  }

  const db = getDb();
  const kpis = await db.getDashboardKpis();

  return NextResponse.json(kpis);
}
