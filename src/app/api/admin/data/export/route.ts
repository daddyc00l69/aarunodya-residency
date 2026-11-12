import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return new NextResponse('Unauthorized: Staff login required', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get('type') || 'customers') as 'customers' | 'reservations' | 'payments' | 'cash_ledger' | 'coupons';
  const start = searchParams.get('start') || undefined;
  const end = searchParams.get('end') || undefined;

  try {
    const db = getDb();
    const rows = await db.getExportDataset(type, { start, end });

    // Generate Excel workbook using SheetJS
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    const sheetTitles: Record<string, string> = {
      customers: 'Guests & Customers',
      reservations: 'Stay Reservations',
      payments: 'Financial Receipts',
      cash_ledger: 'Front Desk Cash Drawer',
      coupons: 'Marketing Coupons'
    };

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitles[type] || 'ExportData');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const today = new Date().toISOString().split('T')[0];
    const filename = `aarunodya_${type}_export_${today}.xlsx`;

    await db.logAudit({
      userId: session.userId,
      userEmail: session.fullName,
      action: 'export_excel_data',
      entityType: 'import_export',
      entityId: `${type}_${today}`,
      details: `Staff ${session.fullName} exported ${rows.length} records for ${type}. Date filter: ${start || 'all'} to ${end || 'all'}.`
    });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Export failed';
    return new NextResponse(`Export failed: ${message}`, { status: 500 });
  }
}

