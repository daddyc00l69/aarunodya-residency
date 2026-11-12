import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

const AdditionalPaymentSchema = z.object({
  bookingReference: z.string().min(1, 'Booking reference is required'),
  amountPaise: z.number().int().min(100, 'Minimum payment is ₹1 (100 paise)'),
  paymentMethod: z.enum(['cash', 'upi', 'card_pos', 'razorpay']).default('cash'),
  notes: z.string().optional()
});

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Staff login required' }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = AdditionalPaymentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payment payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { bookingReference, amountPaise, paymentMethod, notes } = parsed.data;
    const db = getDb();

    const result = await db.recordAdditionalPayment({
      bookingReference,
      amountPaise,
      paymentMethod,
      cashierId: session.userId,
      cashierName: session.fullName,
      notes
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${amountPaise / 100} recorded successfully.`,
      ...result
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record payment';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

