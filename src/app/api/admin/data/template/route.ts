import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getCurrentAdminSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return new NextResponse('Unauthorized: Staff login required', { status: 401 });
  }

  const sampleData = [
    {
      'Full Legal Name': 'Rameshwar Mahadev Shinde',
      'Phone Number': '9822100001',
      'Email Address': 'rameshwar.shinde@example.com',
      'City': 'Solapur',
      'State': 'Maharashtra',
      'Notes': 'Annual Vitthal pilgrim; arrives with family'
    },
    {
      'Full Legal Name': 'Dnyaneshwar Vitthalrao Kadam',
      'Phone Number': '9423200002',
      'Email Address': 'dnyaneshwar.kadam@example.com',
      'City': 'Satara',
      'State': 'Maharashtra',
      'Notes': 'Dindi coordinator; prefers Ground Floor rooms'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Guest_Import_Template');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="aarunodya_guest_import_template.xlsx"'
    }
  });
}
