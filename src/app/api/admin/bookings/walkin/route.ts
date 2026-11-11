import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { calculateNights } from '@/lib/utils/dates';
import { calculatePricing } from '@/lib/utils/currency';

const WalkInSchema = z.object({
  roomTypeId: z.string().min(1, 'Room type is required'),
  roomId: z.string().optional(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-in date required'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-out date required'),
  numAdults: z.number().int().min(1).default(2),
  numChildren: z.number().int().min(0).default(0),
  guestName: z.string().min(2, 'Guest name is required'),
  guestEmail: z.string().email().optional().or(z.literal('')),
  guestPhone: z.string().min(10, 'Valid 10-digit phone number is required'),
  paymentMethod: z.enum(['cash', 'upi', 'card_pos', 'razorpay']).default('cash'),
  isPrePaid: z.boolean().default(true),
  specialRequests: z.string().optional()
});

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = WalkInSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid walk-in payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      roomTypeId,
      roomId,
      checkInDate,
      checkOutDate,
      numAdults,
      numChildren,
      guestName,
      guestEmail,
      guestPhone,
      paymentMethod,
      isPrePaid,
      specialRequests
    } = parsed.data;

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    const db = getDb();
    const rt = await db.getRoomTypeById(roomTypeId);
    if (!rt) {
      return NextResponse.json({ error: 'Room type category not found' }, { status: 404 });
    }

    // Verify availability
    const avail = await db.checkAvailability(checkInDate, checkOutDate, numAdults);
    const rtAvail = avail.find(a => a.roomType.id === roomTypeId);

    if (!rtAvail || rtAvail.availableRoomsCount <= 0) {
      return NextResponse.json(
        { error: 'No rooms available in this category for the requested dates.' },
        { status: 400 }
      );
    }

    const nights = calculateNights(checkInDate, checkOutDate);
    const pricing = calculatePricing({
      basePricePerNightPaise: rt.basePricePaise,
      numNights: nights,
      numAdults,
      baseOccupancy: rt.baseOccupancy,
      extraGuestFeePaise: rt.extraGuestFeePaise
    });

    // Create unique booking reference
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `ARN-WALK-${randSuffix}`;

    // Find assigned room or target room
    const allRooms = await db.getRoomsByRoomType(roomTypeId);
    const targetRoom = (roomId && allRooms.find(r => r.id === roomId)) || allRooms[0];

    // Create or find guest
    const guestId = `guest-walkin-${Date.now()}`;
    const newGuest = {
      id: guestId,
      fullName: guestName,
      email: guestEmail || `${guestPhone}@aarunodya.guest`,
      phone: guestPhone,
      specialRequests,
      createdAt: new Date().toISOString()
    };

    const newBooking = {
      id: `booking-${Date.now()}`,
      bookingReference,
      guestId,
      guest: newGuest,
      checkInDate,
      checkOutDate,
      numNights: nights,
      numAdults,
      numChildren,
      numRooms: 1,
      roomTypeId: rt.id,
      roomType: rt,
      assignedRoomId: targetRoom?.id,
      assignedRoomNumber: targetRoom?.roomNumber,
      status: 'confirmed' as const,
      subtotalPaise: pricing.subtotalPaise,
      extraGuestFeePaise: pricing.extraGuestFeePaise,
      resortFeePaise: 0,
      taxPaise: pricing.taxPaise,
      discountPaise: 0,
      totalAmountPaise: pricing.totalAmountPaise,
      paidAmountPaise: isPrePaid ? pricing.totalAmountPaise : 0,
      specialRequests: specialRequests ? `[Walk-in / Phone]: ${specialRequests}` : '[Walk-in / Phone]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save directly to repository
    const rawDb = (db as any).ensureInitialized();
    rawDb.guests.push(newGuest);
    rawDb.bookings.push(newBooking);

    if (isPrePaid) {
      rawDb.payments.push({
        id: `pay-walkin-${Date.now()}`,
        bookingId: newBooking.id,
        bookingReference: newBooking.bookingReference,
        amountPaise: newBooking.totalAmountPaise,
        currency: 'INR',
        paymentMethod,
        status: 'captured',
        transactionReference: `TXN-${bookingReference}-COUNTER`,
        createdAt: new Date().toISOString(),
        capturedAt: new Date().toISOString()
      });
    }

    await (db as any).persist();

    return NextResponse.json({
      success: true,
      booking: newBooking,
      reference: bookingReference
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to register walk-in reservation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

