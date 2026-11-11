import assert from 'assert';
import crypto from 'crypto';

console.log('🧪 Testing Multi-Lambda Continuity & Cryptographic Token Recovery...');

const SECRET = 'test-secret-key-2026';

function signPayload(payload) {
  const serialized = JSON.stringify(payload);
  const dataB64 = Buffer.from(serialized, 'utf-8').toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(dataB64).digest('base64url');
  return `${dataB64}.${signature}`;
}

function verifyPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [dataB64, providedSig] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET).update(dataB64).digest('base64url');
  if (expectedSig !== providedSig) return null;
  return JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf-8'));
}

// 1. Test signature & verification
const testData = {
  booking: {
    id: 'b-123',
    bookingReference: 'ARN-2026-9999',
    totalAmountPaise: 224000
  },
  guest: {
    fullName: 'Pandharpur Devotee',
    phone: '8530000820'
  }
};

const token = signPayload(testData);
assert(token.includes('.'), 'Token must be formatted with separator');

const decoded = verifyPayload(token);
assert.strictEqual(decoded.booking.bookingReference, 'ARN-2026-9999');
assert.strictEqual(decoded.guest.fullName, 'Pandharpur Devotee');
console.log('✅ Token cryptographic sign & verify passed.');

// 2. Test tamper resistance
const tamperedToken = token.slice(0, 10) + 'X' + token.slice(11);
const failedVerify = verifyPayload(tamperedToken);
assert.strictEqual(failedVerify, null, 'Tampered token must be rejected');
console.log('✅ Tamper detection and cryptographic rejection passed.');

// 3. Test multi-lambda recovery simulation
const lambda1_holdToken = signPayload({
  booking: {
    id: 'booking-fresh-99',
    bookingReference: 'ARN-2026-5555',
    status: 'hold',
    totalAmountPaise: 336000,
    checkInDate: '2026-11-20',
    checkOutDate: '2026-11-22',
    numNights: 2,
    numAdults: 2,
    roomTypeId: 'deluxe-ac-room'
  },
  guest: {
    id: 'guest-fresh-99',
    fullName: 'Vitthal Devotee',
    email: 'devotee@example.com',
    phone: '9876543210'
  }
});

// Lambda 2 receives payment verification with holdToken:
const lambda2_recovered = verifyPayload(lambda1_holdToken);
assert(lambda2_recovered !== null, 'Lambda 2 must recover booking from token');
assert.strictEqual(lambda2_recovered.booking.bookingReference, 'ARN-2026-5555');
console.log('✅ Multi-lambda state continuity verified successfully!');

console.log('🎉 ALL MULTI-LAMBDA RECOVERY TESTS PASSED!');
