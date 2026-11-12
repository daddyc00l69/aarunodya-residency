import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

const CustomerCreateSchema = z.object({
  fullName: z.string().min(2, 'Full legal name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  altPhone: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  vipStatus: z.boolean().optional(),
  notes: z.string().optional()
});

export async function GET(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || undefined;
  const verificationStatus = searchParams.get('status') || undefined;
  const city = searchParams.get('city') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    const db = getDb();
    const result = await db.getCustomers({
      query,
      verificationStatus,
      city,
      page,
      limit
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve customers';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await req.json();
    const normalized = {
      fullName: json.fullName,
      phone: json.phone,
      email: json.email || '',
      dateOfBirth: json.dateOfBirth,
      gender: json.gender,
      altPhone: json.altPhone || json.alternatePhone,
      addressLine1: json.addressLine1 || json.address,
      city: json.city,
      state: json.state,
      postalCode: json.postalCode,
      vipStatus: json.vipStatus ?? false,
      notes: json.notes
    };
    const parsed = CustomerCreateSchema.safeParse(normalized);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid customer data', details: parsed.error.format() }, { status: 400 });
    }

    const db = getDb();
    const customer = await db.createOrUpdateCustomer({
      ...parsed.data,
      email: parsed.data.email || ''
    });

    await db.logAudit({
      userId: session.userId,
      userEmail: session.fullName,
      action: 'create_customer_profile',
      entityType: 'customer',
      entityId: customer.id,
      details: `Created/updated profile for ${customer.fullName} (${customer.phone}, ${customer.email})`
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save customer';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
