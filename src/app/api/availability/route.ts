import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getOffsetDateString } from '@/lib/utils/dates';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkIn = searchParams.get('checkIn') || getOffsetDateString(0);
    const checkOut = searchParams.get('checkOut') || getOffsetDateString(2);
    const adults = parseInt(searchParams.get('adults') || '2', 10);

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'Check-out date must be strictly after check-in date.' },
        { status: 400 }
      );
    }

    const db = getDb();
    const availability = await db.checkAvailability(checkIn, checkOut, adults);

    return NextResponse.json({
      checkIn,
      checkOut,
      adults,
      roomTypes: availability
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to query room availability';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
