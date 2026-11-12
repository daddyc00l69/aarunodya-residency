import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

const CreateCouponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters'),
  description: z.string().min(5, 'Description is required'),
  discountType: z.enum(['fixed', 'percentage']),
  discountValue: z.number().int().min(1, 'Discount value must be at least 1'),
  maxDiscountPaise: z.number().int().positive().optional(),
  minBookingValuePaise: z.number().int().min(0).default(0),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid start date (YYYY-MM-DD) required'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid expiry date (YYYY-MM-DD) required'),
  maxTotalRedemptions: z.number().int().min(1).default(100),
  maxRedemptionsPerCustomer: z.number().int().min(1).default(1),
  eligibleRoomTypeIds: z.array(z.string()).default([]),
  customerEligibility: z.enum(['all', 'first_time', 'returning', 'specific_customers']).default('all'),
  specificCustomerIds: z.array(z.string()).optional(),
  minStayNights: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  adminNotes: z.string().optional()
});

export async function GET(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const coupons = await db.getCoupons();
    const analytics = await db.getCouponAnalytics();

    return NextResponse.json({ coupons, analytics });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch coupons';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only super_admin and manager can create coupons
  if (!['super_admin', 'manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden: Admin or Manager role required to create coupons' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const normalized = {
      code: json.code,
      description: json.description,
      discountType: json.discountType === 'fixed_amount' ? 'fixed' : json.discountType,
      discountValue: json.discountValue,
      maxDiscountPaise: json.maxDiscountPaise ?? json.maxDiscountAmountPaise,
      minBookingValuePaise: json.minBookingValuePaise ?? json.minBookingAmountPaise ?? 0,
      startDate: json.startDate ? json.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: json.expiryDate ? json.expiryDate.split('T')[0] : '2030-12-31',
      maxTotalRedemptions: json.maxTotalRedemptions ?? json.maxRedemptions ?? 100,
      maxRedemptionsPerCustomer: json.maxRedemptionsPerCustomer ?? 1,
      eligibleRoomTypeIds: json.eligibleRoomTypeIds || [],
      customerEligibility: json.customerEligibility ?? json.eligibleCustomerType ?? 'all',
      specificCustomerIds: json.specificCustomerIds,
      minStayNights: json.minStayNights ?? 1,
      isActive: json.isActive ?? true,
      adminNotes: json.adminNotes
    };
    const parsed = CreateCouponSchema.safeParse(normalized);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid coupon data', details: parsed.error.format() }, { status: 400 });
    }

    const db = getDb();
    const coupon = await db.createCoupon(parsed.data);

    await db.logAudit({
      userId: session.userId,
      userEmail: session.fullName,
      action: 'create_coupon',
      entityType: 'coupon',
      entityId: coupon.id,
      details: `Created coupon ${coupon.code} (${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue / 100}`}). Valid ${coupon.startDate} to ${coupon.expiryDate}.`
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create coupon';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
