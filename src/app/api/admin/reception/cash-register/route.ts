import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Staff login required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || undefined;

  try {
    const db = getDb();
    const report = await db.getCashRegisterReport(date);

    return NextResponse.json({
      ...report,
      summary: {
        totalPaymentsPaise: report.totalPaymentsCollectedPaise,
        totalRefundsPaise: report.totalRefundsIssuedPaise,
        netCashPaise: report.netCashCollectedPaise,
        totalTransactionsCount: report.totalTransactionsCount,
        paymentsCount: report.transactions.filter(t => t.transactionType === 'payment').length,
        refundsCount: report.transactions.filter(t => t.transactionType === 'refund').length,
        openingFloatPaise: report.activeShift?.openingFloatPaise || 0
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch cash register report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
