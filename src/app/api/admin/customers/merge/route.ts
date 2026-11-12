import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

const MergeSchema = z.object({
  sourceCustomerId: z.string().min(1, 'Source customer ID is required'),
  targetCustomerId: z.string().min(1, 'Target customer ID is required')
});

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Merge requires super_admin or manager
  if (!['super_admin', 'manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden: Manager or Admin role required to merge customer profiles' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const normalized = {
      sourceCustomerId: json.sourceCustomerId || json.secondaryCustomerId,
      targetCustomerId: json.targetCustomerId || json.primaryCustomerId
    };
    const parsed = MergeSchema.safeParse(normalized);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid merge request', details: parsed.error.format() }, { status: 400 });
    }

    const { sourceCustomerId, targetCustomerId } = parsed.data;
    const db = getDb();

    const mergedCustomer = await db.mergeCustomers(sourceCustomerId, targetCustomerId, {
      userId: session.userId,
      fullName: session.fullName
    });

    return NextResponse.json({
      success: true,
      message: `Successfully merged customer ${sourceCustomerId} into ${targetCustomerId}.`,
      customer: mergedCustomer
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Merge failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
