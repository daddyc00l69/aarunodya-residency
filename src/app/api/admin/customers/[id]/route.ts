import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDb();
    const details = await db.getCustomerById(id);

    if (!details) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve customer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
