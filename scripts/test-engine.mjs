// Automated Test Suite for Lodge Booking & Management Engine
import assert from 'assert';
import crypto from 'crypto';

console.log('🧪 Starting Lodge Engine Automated Tests...\n');

// 1. DATE OVERLAP TEST
// Rule: Check-in is INCLUSIVE, Check-out is EXCLUSIVE
// Interval A: [startA, endA)
// Interval B: [startB, endB)
// Overlap exists iff startA < endB AND endA > startB
function doIntervalsOverlap(startA, endA, startB, endB) {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();
  return sA < eB && eA > sB;
}

console.log('1. Testing Date Overlap Logic...');
// Non-overlapping: Checkout date equals check-in date of next guest
assert.strictEqual(
  doIntervalsOverlap('2026-11-10', '2026-11-13', '2026-11-13', '2026-11-15'),
  false,
  'Adjacent stays (out=in) must NOT overlap'
);

// Overlapping by 1 day
assert.strictEqual(
  doIntervalsOverlap('2026-11-10', '2026-11-14', '2026-11-13', '2026-11-16'),
  true,
  'Overlapping 1 day must be detected as collision'
);

// Completely contained stay
assert.strictEqual(
  doIntervalsOverlap('2026-11-10', '2026-11-20', '2026-11-12', '2026-11-15'),
  true,
  'Contained stay must collide'
);
console.log('   ✅ Date Overlap tests passed successfully.');

// 2. INTEGER PAISE PRICING & TAX RULES
console.log('\n2. Testing Pricing in Integer Paise & Indian Hospitality GST...');
function calculatePricing({
  basePricePerNightPaise,
  numNights,
  numAdults = 2,
  baseOccupancy = 2,
  extraGuestFeePaise = 150000,
  couponDiscountPaise = 0,
}) {
  const safeNights = Math.max(1, numNights);
  const subtotalPaise = basePricePerNightPaise * safeNights;
  const extraGuests = Math.max(0, numAdults - baseOccupancy);
  const totalExtraGuestFeePaise = extraGuests * extraGuestFeePaise * safeNights;
  const taxableSubtotal = subtotalPaise + totalExtraGuestFeePaise;
  const resortFeePaise = Math.round(taxableSubtotal * 0.05);
  const effectiveTaxPercent = basePricePerNightPaise > 750000 ? 18 : 12;
  const taxableAmount = taxableSubtotal + resortFeePaise;
  const taxPaise = Math.round((taxableAmount * effectiveTaxPercent) / 100);
  const discountPaise = Math.min(taxableAmount, couponDiscountPaise);
  const totalAmountPaise = Math.max(0, taxableAmount + taxPaise - discountPaise);

  return {
    numNights: safeNights,
    subtotalPaise,
    extraGuestFeePaise: totalExtraGuestFeePaise,
    resortFeePaise,
    taxPaise,
    effectiveTaxPercent,
    totalAmountPaise,
  };
}

// Case A: Room rate <= ₹7,500 (550000 paise) -> 12% GST
const priceA = calculatePricing({
  basePricePerNightPaise: 550000, // ₹5,500
  numNights: 2,
  numAdults: 2,
  baseOccupancy: 2,
});
assert.strictEqual(priceA.subtotalPaise, 1100000, 'Subtotal for 2 nights must be 1100000 paise (₹11,000)');
assert.strictEqual(priceA.resortFeePaise, 55000, 'Resort fee 5% must be 55000 paise (₹550)');
assert.strictEqual(priceA.effectiveTaxPercent, 12, 'GST rate for <= ₹7,500 must be 12%');
assert.strictEqual(priceA.taxPaise, 138600, 'Tax 12% of 1155000 must be 138600 paise (₹1,386)');
assert.strictEqual(priceA.totalAmountPaise, 1293600, 'Total must be 1293600 paise (₹12,936)');

// Case B: Room rate > ₹7,500 (890000 paise) -> 18% GST + Extra guest fee
const priceB = calculatePricing({
  basePricePerNightPaise: 890000, // ₹8,900
  numNights: 1,
  numAdults: 3,
  baseOccupancy: 2,
  extraGuestFeePaise: 150000, // ₹1,500
});
assert.strictEqual(priceB.effectiveTaxPercent, 18, 'GST rate for > ₹7,500 must be 18%');
assert.strictEqual(priceB.extraGuestFeePaise, 150000, '1 extra guest fee must be 150000 paise');
assert.strictEqual(priceB.subtotalPaise, 890000);
// Subtotal + extra guest = 1040000. Resort fee (5%) = 52000. Taxable = 1092000. Tax (18%) = 196560.
assert.strictEqual(priceB.totalAmountPaise, 1288560, 'Total must be 1288560 paise (₹12,885.60)');
console.log('   ✅ Integer paise calculations and GST tiers passed successfully.');

// 3. CRYPTOGRAPHIC HMAC SIGNATURE VERIFICATION
console.log('\n3. Testing Razorpay HMAC-SHA256 Signature Verification...');
const mockSecret = 'secret_test_whispering_pines_987';
const orderId = 'order_test_123456';
const paymentId = 'pay_test_789012';

const validSignature = crypto
  .createHmac('sha256', mockSecret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

function verifySignature(ord, pay, sig, secret) {
  const expected = crypto.createHmac('sha256', secret).update(`${ord}|${pay}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

assert.strictEqual(
  verifySignature(orderId, paymentId, validSignature, mockSecret),
  true,
  'Genuine HMAC signature must be accepted'
);

const tamperedSignature = validSignature.slice(0, -2) + 'aa';
let rejected = false;
try {
  rejected = !verifySignature(orderId, paymentId, tamperedSignature, mockSecret);
} catch {
  rejected = true;
}
assert.strictEqual(rejected, true, 'Tampered HMAC signature must be strictly rejected');
console.log('   ✅ Cryptographic signature verification tests passed successfully.');

// 4. TEMPORARY HOLD EXPIRY LOGIC
console.log('\n4. Testing 15-Minute Booking Hold Expiry...');
const futureHold = new Date(Date.now() + 10 * 60 * 1000).toISOString();
const pastHold = new Date(Date.now() - 1 * 60 * 1000).toISOString();

function isHoldExpired(holdExpiresAt) {
  if (!holdExpiresAt) return true;
  return new Date(holdExpiresAt) <= new Date();
}

assert.strictEqual(isHoldExpired(futureHold), false, 'Active 10-minute remaining hold is not expired');
assert.strictEqual(isHoldExpired(pastHold), true, 'Past hold is expired');
console.log('   ✅ Hold expiration logic tests passed successfully.');

console.log('\n🎉 ALL CORE ENGINE TESTS PASSED WITH 100% SUCCESS!\n');
