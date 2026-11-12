import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

const OpenShiftSchema = z.object({
  action: z.literal('open'),
  openingFloatPaise: z.number().int().min(0, 'Float cannot be negative')
});

const CloseShiftSchema = z.object({
  action: z.literal('close'),
  shiftId: z.string().optional(),
  actualClosingCashPaise: z.number().int().min(0).default(0),
  notes: z.string().optional()
});

const ShiftActionSchema = z.discriminatedUnion('action', [OpenShiftSchema, CloseShiftSchema]);

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const raw = await req.json();
    const normalized = {
      action: raw.action,
      openingFloatPaise: raw.openingFloatPaise,
      shiftId: raw.shiftId,
      actualClosingCashPaise: raw.actualClosingCashPaise ?? raw.closingActualCashPaise ?? 0,
      notes: raw.notes
    };
    const parsed = ShiftActionSchema.safeParse(normalized);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid shift payload', details: parsed.error.format() }, { status: 400 });
    }

    const db = getDb();

    if (parsed.data.action === 'open') {
      const shift = await db.openCashShift({
        openedByStaffId: session.userId,
        openedByStaffName: session.fullName,
        openingFloatPaise: parsed.data.openingFloatPaise
      });
      return NextResponse.json({ success: true, shift });
    } else {
      let targetShiftId = parsed.data.shiftId;
      if (!targetShiftId) {
        const rawDb = (db as any).ensureInitialized();
        const active = rawDb.cashShifts.find((s: any) => s.status === 'open');
        if (!active) {
          throw new Error('No open cash shift found to close');
        }
        targetShiftId = active.id;
      }

      const shift = await db.closeCashShift({
        shiftId: targetShiftId!,
        actualClosingCashPaise: parsed.data.actualClosingCashPaise,
        notes: parsed.data.notes,
        closedByStaffId: session.userId,
        closedByStaffName: session.fullName
      });
      return NextResponse.json({ success: true, shift });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Shift operation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
