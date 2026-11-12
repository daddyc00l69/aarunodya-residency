import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return new NextResponse('Unauthorized: Staff login required to access identity documents', { status: 401 });
  }

  try {
    const { id: documentId } = await params;
    const db = getDb();
    const rawDb = (db as any).ensureInitialized();

    // Find document across customer records
    let foundDoc: any = null;
    let customerOwner: any = null;

    for (const c of rawDb.customers) {
      const match = c.documents?.find((d: any) => d.id === documentId);
      if (match) {
        foundDoc = match;
        customerOwner = c;
        break;
      }
    }

    if (!foundDoc || !foundDoc.filePath || !fs.existsSync(foundDoc.filePath)) {
      return new NextResponse('Document file not found on private storage', { status: 404 });
    }

    // Record audit log for accessing sensitive ID document
    await db.logAudit({
      userId: session.userId,
      userEmail: session.fullName,
      action: 'view_identity_document',
      entityType: 'document',
      entityId: documentId,
      details: `Staff ${session.fullName} viewed ${foundDoc.documentType} document of ${customerOwner.fullName} (${customerOwner.id}).`
    });

    const fileBuffer = fs.readFileSync(foundDoc.filePath);
    const mimeType = foundDoc.fileMimeType || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${foundDoc.originalFileName || 'id_document'}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error accessing document';
    return new NextResponse(message, { status: 500 });
  }
}
