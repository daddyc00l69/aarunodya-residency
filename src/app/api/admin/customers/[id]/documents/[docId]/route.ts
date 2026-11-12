import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { VerificationStatus } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: customerId, docId } = await params;
    const json = await req.json();
    const { status } = json as { status: VerificationStatus };

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    const db = getDb();
    const doc = await db.verifyCustomerDocument(customerId, docId, status, {
      userId: session.userId,
      fullName: session.fullName
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
