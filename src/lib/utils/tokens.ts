import crypto from 'crypto';

function getSigningKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    'aarunodya-residency-bhakt-niwas-secure-signing-key-2026'
  );
}

/**
 * Signs any JSON-serializable payload into a tamper-proof base64url token
 * Format: base64url(payload).signature
 */
export function signPayload<T = Record<string, unknown>>(payload: T): string {
  const serialized = JSON.stringify(payload);
  const dataB64 = Buffer.from(serialized, 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSigningKey())
    .update(dataB64)
    .digest('base64url');

  return `${dataB64}.${signature}`;
}

/**
 * Cryptographically verifies and extracts a payload from a signed token.
 * Returns null if the token is tampered, corrupted, or invalid.
 */
export function verifyPayload<T = Record<string, unknown>>(token: string | undefined | null): T | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [dataB64, providedSig] = parts;

  try {
    const expectedSig = crypto
      .createHmac('sha256', getSigningKey())
      .update(dataB64)
      .digest('base64url');

    const expectedBuffer = Buffer.from(expectedSig, 'utf-8');
    const providedBuffer = Buffer.from(providedSig, 'utf-8');

    if (expectedBuffer.length !== providedBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
      return null;
    }

    const jsonStr = Buffer.from(dataB64, 'base64url').toString('utf-8');
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}
