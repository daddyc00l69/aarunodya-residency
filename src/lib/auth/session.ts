import crypto from 'crypto';
import { cookies } from 'next/headers';
import { UserRole } from '../types';

export interface AdminSession {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  expiresAt: number;
}

const SESSION_COOKIE_NAME = 'lodge_staff_session';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'lodge_secret_key_prod_aarunodya_residency_2026';

export function signSession(session: Omit<AdminSession, 'expiresAt'>): string {
  const payload: AdminSession = {
    ...session,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');

  return `${base64Payload}.${signature}`;
}

export function verifySession(token: string): AdminSession | null {
  try {
    const [base64Payload, signature] = token.split('.');
    if (!base64Payload || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(base64Payload)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const session = JSON.parse(jsonStr) as AdminSession;

    if (Date.now() > session.expiresAt) return null;

    return session;
  } catch {
    return null;
  }
}

export async function getCurrentAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export { SESSION_COOKIE_NAME };
