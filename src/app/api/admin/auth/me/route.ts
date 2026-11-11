import { NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      email: session.email,
      role: session.role,
      fullName: session.fullName
    }
  });
}
