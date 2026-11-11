import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { razorpayService } from '@/lib/services/razorpay';

const HoldSchema = z.object({
  roomTypeId: z.string().min(1, 'Room type is required'),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-in date (YYYY-MM-DD) required'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-out date (YYYY-MM-DD) required'),
  numAdults: z.number().int().min(1, 'At least 1 adult is required'),
  numChildren: z.number().int().min(0).default(0),
  guestName: z.string().min(2, 'Full guest name is required'),
  guestEmail: z.string().email('Valid email is required'),
  guestPhone: z.string().min(8, 'Valid phone number is required'),
  specialRequests: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = HoldSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      roomTypeId,
      checkInDate,
      checkOutDate,
      numAdults,
      numChildren,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests
    } = parsed.data;

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Acquire 15-minute checkout hold
    const { booking, reference } = await db.createBookingHold({
      roomTypeId,
      checkInDate,
      checkOutDate,
      numAdults,
      numChildren,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests
    });

    // Create Razorpay payment order
    const order = await razorpayService.createOrder({
      amountPaise: booking.totalAmountPaise,
      receipt: reference,
      notes: {
        bookingReference: reference,
        roomTypeId,
        guestEmail
      }
    });

    return NextResponse.json({
      success: true,
      bookingReference: reference,
      booking,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        isMock: order.isMock
      },
      keyId: razorpayService.getKeyId(),
      holdExpiresAt: booking.holdExpiresAt
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to reserve booking hold';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
