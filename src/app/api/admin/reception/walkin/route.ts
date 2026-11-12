import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

const ReceptionWalkInSchema = z.object({
  roomTypeId: z.string().min(1, 'Room type category is required'),
  assignedRoomId: z.string().optional(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-in date (YYYY-MM-DD) required'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-out date (YYYY-MM-DD) required'),
  numAdults: z.number().int().min(1).default(2),
  numChildren: z.number().int().min(0).default(0),
  guestName: z.string().min(2, 'Guest full legal name is required'),
  guestPhone: z.string().min(10, 'Valid 10-digit phone number is required'),
  guestEmail: z.string().email().optional().or(z.literal('')),
  guestAddress: z.string().optional(),
  guestCity: z.string().optional(),
  guestState: z.string().optional(),
  guestIdProofType: z.enum(['aadhaar', 'passport', 'driving_license', 'voter_id', 'other']).optional(),
  guestIdProofNumber: z.string().optional(),
  additionalGuests: z.array(z.object({
    id: z.string().optional(),
    fullName: z.string(),
    age: z.number().optional(),
    gender: z.string().optional(),
    idProofType: z.enum(['aadhaar', 'passport', 'driving_license', 'voter_id', 'other']).optional(),
    idProofNumberMasked: z.string().optional(),
    phone: z.string().optional()
  })).optional(),
  couponCode: z.string().optional(),
  cashAmountPaidPaise: z.number().int().min(0).default(0),
  paymentMethod: z.enum(['cash', 'upi', 'card_pos', 'razorpay']).default('cash'),
  autoCheckIn: z.boolean().default(false),
  specialRequests: z.string().optional()
});

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Staff login required' }, { status: 401 });
  }

  // Check roles: super_admin, manager, front_desk, accounts, owner can register walk-ins
  if (!['super_admin', 'manager', 'front_desk', 'accounts', 'owner'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient privileges for front-desk bookings' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const normalized = {
      roomTypeId: json.roomTypeId,
      assignedRoomId: json.assignedRoomId || json.roomNumber,
      checkInDate: json.checkInDate,
      checkOutDate: json.checkOutDate,
      numAdults: json.numAdults || json.guestCount || 2,
      numChildren: json.numChildren || 0,
      guestName: json.guestName || json.guest?.fullName,
      guestPhone: json.guestPhone || json.guest?.phone,
      guestEmail: json.guestEmail !== undefined ? json.guestEmail : json.guest?.email,
      guestAddress: json.guestAddress || json.guest?.address,
      guestCity: json.guestCity || json.guest?.city,
      guestState: json.guestState || json.guest?.state,
      guestIdProofType: json.guestIdProofType || json.guest?.idType,
      guestIdProofNumber: json.guestIdProofNumber || json.guest?.idNumber,
      additionalGuests: json.additionalGuests,
      couponCode: json.couponCode,
      cashAmountPaidPaise: json.cashAmountPaidPaise ?? json.cashPaidPaise ?? 0,
      paymentMethod: json.paymentMethod || 'cash',
      autoCheckIn: json.autoCheckIn ?? false,
      specialRequests: json.specialRequests || json.paymentNotes
    };

    const parsed = ReceptionWalkInSchema.safeParse(normalized);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid reception booking payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const db = getDb();

    const result = await db.createReceptionBooking({
      roomTypeId: data.roomTypeId,
      assignedRoomId: data.assignedRoomId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      numAdults: data.numAdults,
      numChildren: data.numChildren,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      guestEmail: data.guestEmail || undefined,
      guestAddress: data.guestAddress,
      guestCity: data.guestCity,
      guestState: data.guestState,
      guestIdProofType: data.guestIdProofType,
      guestIdProofNumber: data.guestIdProofNumber,
      additionalGuests: data.additionalGuests ? data.additionalGuests.map((g, idx) => ({
        id: g.id || `ag-${idx}-${Date.now()}`,
        bookingId: '',
        fullName: g.fullName,
        age: g.age,
        gender: g.gender,
        idProofType: g.idProofType,
        idProofNumberMasked: g.idProofNumberMasked,
        phone: g.phone
      })) : undefined,
      couponCode: data.couponCode,
      cashAmountPaidPaise: data.cashAmountPaidPaise,
      paymentMethod: data.paymentMethod,
      autoCheckIn: data.autoCheckIn,
      specialRequests: data.specialRequests,
      staffId: session.userId,
      staffName: session.fullName
    });

    return NextResponse.json({
      success: true,
      message: 'Reception booking created successfully',
      ...result
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to register walk-in reservation';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
