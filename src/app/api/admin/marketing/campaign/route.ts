import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

const UpdateCampaignSchema = z.object({
  name: z.string().min(3).optional(),
  isEnabled: z.boolean().optional(),
  discountType: z.enum(['fixed', 'percentage']).optional(),
  discountValue: z.number().int().min(1).optional(),
  maxDiscountPaise: z.number().int().positive().nullable().optional(),
  minBookingValuePaise: z.number().int().min(0).optional(),
  validityDays: z.number().int().min(1).max(365).optional(),
  emailSubject: z.string().min(5).optional(),
  promotionalMessage: z.string().optional(),
  generateUniqueCodePerCustomer: z.boolean().optional(),
  allowRepeatedIssuanceAfterFutureStays: z.boolean().optional(),
  cooldownDaysBetweenIssuance: z.number().int().min(1).optional()
});

export async function GET(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const campaign = await db.getPostCheckoutCampaign();
    const notifications = await db.getEmailNotifications();

    return NextResponse.json({
      campaign,
      notifications,
      recentNotifications: notifications.slice(0, 100)
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch campaign';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!['super_admin', 'manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden: Admin privilege required' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const parsed = UpdateCampaignSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid campaign payload', details: parsed.error.format() }, { status: 400 });
    }

    const db = getDb();
    const cleanUpdates = {
      ...parsed.data,
      maxDiscountPaise: parsed.data.maxDiscountPaise === null ? undefined : parsed.data.maxDiscountPaise
    };

    const campaign = await db.updatePostCheckoutCampaign(cleanUpdates);

    await db.logAudit({
      userId: session.userId,
      userEmail: session.fullName,
      action: 'update_post_checkout_campaign',
      entityType: 'coupon',
      entityId: campaign.id,
      details: `Updated post-checkout loyalty campaign "${campaign.name}". Enabled: ${campaign.isEnabled}`
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update campaign';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
