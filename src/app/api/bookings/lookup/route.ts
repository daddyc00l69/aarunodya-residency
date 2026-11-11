import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPayload } from '@/lib/utils/tokens';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');
    const email = searchParams.get('email');

    if (!reference) {
      return NextResponse.json(
        { error: 'Booking reference is required' },
        { status: 400 }
      );
    }

    const cleanRef = reference.trim().toUpperCase();
    const db = getDb();
    let result = await db.getBookingByReference(cleanRef, email || undefined);

    // If not found in current lambda memory, check signed cookies
    if (!result) {
      const rawToken =
        req.cookies.get(`arn_confirmed_${cleanRef}`)?.value ||
        req.cookies.get(`arn_booking_${cleanRef}`)?.value ||
        req.cookies.get('arn_latest_booking')?.value;

      if (rawToken) {
        const verified = verifyPayload<{
          booking: any;
          guest?: any;
          roomType?: any;
          payments?: any[];
        }>(rawToken);

        if (verified && verified.booking && verified.booking.bookingReference.toUpperCase() === cleanRef) {
          await db.syncBookingRecord(verified);
          result = await db.getBookingByReference(cleanRef, email || undefined);
        }
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: 'No reservation found matching this booking reference and email.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lookup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
