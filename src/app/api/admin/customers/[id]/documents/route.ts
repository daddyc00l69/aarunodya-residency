import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { IdDocumentType } from '@/lib/types';

const SECURE_DOCS_DIR = path.join(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? os.tmpdir() : path.join(process.cwd(), 'data'),
  'secure_documents'
);

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Staff login required' }, { status: 401 });
  }

  try {
    const { id: customerId } = await params;
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const documentType = (formData.get('documentType') as IdDocumentType) || 'aadhaar';
    const documentNumberRaw = (formData.get('documentNumber') as string) || '';
    const issuingCountry = (formData.get('issuingCountry') as string) || 'India';
    const expiryDate = (formData.get('expiryDate') as string) || undefined;

    if (!documentNumberRaw.trim()) {
      return NextResponse.json({ error: 'Identity document number is required' }, { status: 400 });
    }

    let filePath: string | undefined = undefined;
    let fileMimeType: string | undefined = undefined;
    let fileSizeBytes: number | undefined = undefined;
    let originalFileName: string | undefined = undefined;

    if (file && typeof file.arrayBuffer === 'function') {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'File size exceeds maximum allowed 5MB limit' }, { status: 400 });
      }

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json({
          error: `Unsupported file type (${file.type}). Only JPG, PNG, and PDF files are permitted.`
        }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Ensure private secure documents directory exists
      if (!fs.existsSync(SECURE_DOCS_DIR)) {
        fs.mkdirSync(SECURE_DOCS_DIR, { recursive: true });
      }

      const safeExt = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'dat';
      const storedFileName = `doc_${customerId}_${Date.now()}.${safeExt}`;
      const fullPath = path.join(SECURE_DOCS_DIR, storedFileName);

      fs.writeFileSync(fullPath, buffer);

      filePath = fullPath;
      fileMimeType = file.type;
      fileSizeBytes = file.size;
      originalFileName = file.name;
    }

    // Format masked number for display
    const rawClean = documentNumberRaw.trim();
    const masked = rawClean.length > 4 
      ? `XXXX-XXXX-${rawClean.slice(-4)}` 
      : rawClean;

    const db = getDb();
    const doc = await db.uploadCustomerIdDocument(customerId, {
      documentType,
      documentNumberMasked: masked,
      issuingCountry,
      expiryDate,
      filePath,
      fileMimeType,
      fileSizeBytes,
      originalFileName,
      verificationStatus: 'verified',
      verifiedByStaffId: session.userId,
      verifiedByStaffName: session.fullName,
      verifiedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Document upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
