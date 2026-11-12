import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { calculateNights } from '@/lib/utils/dates';

const ValidateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  roomTypeId: z.string().min(1, 'Room type is required'),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-in date required'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid check-out date required'),
  subtotalPaise: z.number().int().min(0, 'Subtotal is required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().optional().or(z.literal('')),
  customerId: z.string().optional().or(z.literal(''))
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const normalized = {
      code: json.code || json.couponCode,
      roomTypeId: json.roomTypeId || 'rt-deluxe-ac',
      checkInDate: json.checkInDate || today,
      checkOutDate: json.checkOutDate || tomorrow,
      subtotalPaise: json.subtotalPaise ?? json.bookingAmountPaise ?? 0,
      customerEmail: json.customerEmail || json.email || '',
      customerPhone: json.customerPhone || json.phone || json.guestPhone || '',
      customerId: json.customerId || ''
    };

    const parsed = ValidateCouponSchema.safeParse(normalized);

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, isValid: false, reason: 'Invalid validation request payload', error: 'Invalid validation request payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { code, roomTypeId, checkInDate, checkOutDate, subtotalPaise, customerEmail, customerPhone, customerId } = parsed.data;
    const nights = calculateNights(checkInDate, checkOutDate);

    const db = getDb();
    const result = await db.validateCoupon({
      code,
      roomTypeId,
      checkInDate,
      checkOutDate,
      numNights: nights,
      subtotalPaise,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      customerId: customerId || undefined
    });

    if (!result.isValid) {
      return NextResponse.json({
        valid: false,
        isValid: false,
        error: result.reason,
        reason: result.reason,
        discountPaise: 0,
        finalPayablePaise: subtotalPaise
      });
    }

    return NextResponse.json({
      valid: true,
      isValid: true,
      coupon: {
        code: result.coupon?.code,
        description: result.coupon?.description,
        discountType: result.coupon?.discountType,
        discountValue: result.coupon?.discountValue
      },
      discountPaise: result.discountPaise,
      finalPayablePaise: result.finalPayablePaise
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Coupon validation failed';
    return NextResponse.json({ valid: false, isValid: false, reason: message, error: message }, { status: 500 });
  }
}
