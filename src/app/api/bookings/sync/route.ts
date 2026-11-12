import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPayload } from '@/lib/utils/tokens';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { reference, token, data } = json;

    const db = getDb();

    // 1. If cryptographic token provided, verify it
    if (token) {
      const verified = verifyPayload<{
        booking: any;
        guest?: any;
        roomType?: any;
        payments?: any[];
      }>(token);

      if (verified && verified.booking) {
        await db.syncBookingRecord(verified);
        const result = await db.getBookingByReference(verified.booking.bookingReference);
        return NextResponse.json({ success: true, ...result });
      }
    }

    // 2. If direct data provided, check reference match
    if (data && data.booking && data.booking.bookingReference) {
      await db.syncBookingRecord(data);
      const result = await db.getBookingByReference(data.booking.bookingReference);
      return NextResponse.json({ success: true, ...result });
    }

    // 3. Fallback lookup by reference
    if (reference) {
      const result = await db.getBookingByReference(reference);
      if (result) {
        return NextResponse.json({ success: true, ...result });
      }
    }

    return NextResponse.json({ error: 'Unable to sync or verify booking record' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

