import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { BookingStatus } from '@/lib/types';

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
  }

  const db = getDb();
  const bookings = await db.getAllBookings();

  return NextResponse.json({ bookings });
}

export async function PATCH(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
  }

  try {
    const { bookingId, status, assignedRoomId, cancellationReason, guestUpdates } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Booking ID and target status are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const updated = await db.updateBookingStatus(bookingId, status as BookingStatus, {
      assignedRoomId,
      cancellationReason
    });

    if (!updated) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (guestUpdates && updated.guestId) {
      await db.updateGuest(updated.guestId, guestUpdates);
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update booking status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
