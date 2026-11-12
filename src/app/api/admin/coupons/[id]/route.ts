import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

const UpdateCouponSchema = z.object({
  code: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  discountType: z.enum(['fixed', 'percentage']).optional(),
  discountValue: z.number().int().min(1).optional(),
  maxDiscountPaise: z.number().int().positive().nullable().optional(),
  minBookingValuePaise: z.number().int().min(0).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  maxTotalRedemptions: z.number().int().min(1).optional(),
  maxRedemptionsPerCustomer: z.number().int().min(1).optional(),
  eligibleRoomTypeIds: z.array(z.string()).optional(),
  customerEligibility: z.enum(['all', 'first_time', 'returning', 'specific_customers']).optional(),
  minStayNights: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  adminNotes: z.string().optional()
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!['super_admin', 'manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = UpdateCouponSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update payload', details: parsed.error.format() }, { status: 400 });
    }

    const db = getDb();
    const cleanUpdates = {
      ...parsed.data,
      maxDiscountPaise: parsed.data.maxDiscountPaise === null ? undefined : parsed.data.maxDiscountPaise
    };

    const coupon = await db.updateCoupon(id, cleanUpdates);

    await db.logAudit({
      userId: session.userId,
      userEmail: session.fullName,
      action: 'update_coupon',
      entityType: 'coupon',
      entityId: id,
      details: `Updated coupon ${coupon.code}. Status: ${coupon.isActive ? 'ACTIVE' : 'INACTIVE'}`
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update coupon';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentAdminSession();
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden: Super admin privilege required to delete coupons' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const db = getDb();
    const success = await db.deleteCoupon(id);

    if (!success) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    await db.logAudit({
      userId: session.userId,
      userEmail: session.fullName,
      action: 'delete_coupon',
      entityType: 'coupon',
      entityId: id,
      details: `Deleted coupon ID ${id}`
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete coupon';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
