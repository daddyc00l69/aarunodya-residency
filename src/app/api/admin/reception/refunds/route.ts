import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

const RefundSchema = z.object({
  bookingReference: z.string().min(1, 'Booking reference is required'),
  refundAmountPaise: z.number().int().min(100, 'Minimum refund is ₹1 (100 paise)'),
  reason: z.string().min(3, 'Detailed refund reason is required'),
  managerPin: z.string().optional() // Optional manager pin or authorization check
});

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Staff login required' }, { status: 401 });
  }

  // Refunds require super_admin, manager, or accounts role
  if (!['super_admin', 'manager', 'accounts'].includes(session.role)) {
    return NextResponse.json({
      error: 'Forbidden: Cash refunds strictly require Manager, Accounts, or Admin authorization.'
    }, { status: 403 });
  }

  try {
    const json = await req.json();
    const normalized = {
      bookingReference: json.bookingReference,
      refundAmountPaise: json.refundAmountPaise ?? json.amountPaise,
      reason: json.reason,
      managerPin: json.managerPin || json.authorizationPin
    };
    const parsed = RefundSchema.safeParse(normalized);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid refund payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { bookingReference, refundAmountPaise, reason } = parsed.data;
    const db = getDb();

    const result = await db.recordCashRefund({
      bookingReference,
      refundAmountPaise,
      authorizedByManagerId: session.userId,
      authorizedByManagerName: session.fullName,
      cashierId: session.userId,
      cashierName: session.fullName,
      reason
    });

    return NextResponse.json({
      success: true,
      message: `Cash refund of ₹${refundAmountPaise / 100} authorized and recorded successfully.`,
      ...result
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process refund';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
