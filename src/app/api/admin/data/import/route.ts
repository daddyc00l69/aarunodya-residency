import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Staff login required' }, { status: 401 });
  }

  // Import requires super_admin or manager
  if (!['super_admin', 'manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden: Admin or Manager permission required to import customer data' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const strategy = (formData.get('strategy') as string || 'skip') as 'skip' | 'update' | 'fail';

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Please upload an Excel (.xlsx) or CSV file' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return NextResponse.json({ error: 'Uploaded file has no readable sheets' }, { status: 400 });
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'Uploaded spreadsheet is empty' }, { status: 400 });
    }

    const db = getDb();
    const result = await db.importCustomersBatch(rawRows, strategy, {
      userId: session.userId,
      fullName: session.fullName
    });

    return NextResponse.json({
      success: true,
      job: result
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Import failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

