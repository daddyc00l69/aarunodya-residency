import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await req.json();
    const { notificationId } = json;

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const db = getDb();
    const notif = await db.retryEmailNotification(notificationId);

    return NextResponse.json({ success: true, notification: notif });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Retry failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

