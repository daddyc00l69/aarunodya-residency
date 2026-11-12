import assert from 'node:assert';
import crypto from 'node:crypto';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

function getStaffCookie() {
  let secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    try {
      const fs = require('fs');
      if (fs.existsSync('.env.local')) {
        const env = fs.readFileSync('.env.local', 'utf-8');
        const m = env.match(/ADMIN_SESSION_SECRET="?([^"\r\n]+)"?/);
        if (m) secret = m[1];
      }
    } catch {}
  }
  secret = secret || 'lodge_secret_key_prod_aarunodya_residency_2026';
  const payload = {
    userId: 'usr-admin-01',
    email: 'admin@aarunodya.com',
    role: 'super_admin',
    fullName: 'Yuvaraj Malave (Super Admin)',
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(base64Payload).digest('base64url');
  return `lodge_staff_session=${base64Payload}.${signature}`;
}

async function runMasterVerification() {
  console.log('=====================================================');
  console.log('   AARUNODYA RESIDENCY — 5 ADVANCED FEATURES TEST    ');
  console.log(`   Target Server: ${BASE_URL}                       `);
  console.log('=====================================================\n');

  const authCookie = getStaffCookie();
  const staffHeaders = {
    'Cookie': authCookie,
    'Content-Type': 'application/json'
  };

  // -------------------------------------------------------------------------
  // FEATURE ONE: RECEPTION CASH BOOKING SYSTEM
  // -------------------------------------------------------------------------
  console.log('\n--- Testing Feature 1: Reception Cash Booking System ---');
  
  // 1. Walk-in cash booking
  const timeSeed = Date.now();
  const year = 2028 + Math.floor((timeSeed % 100000) / 10000);
  const month = String(1 + (timeSeed % 12)).padStart(2, '0');
  const day = String(1 + (timeSeed % 20)).padStart(2, '0');
  const checkInDate = `${year}-${month}-${day}`;
  const d2 = new Date(`${checkInDate}T00:00:00Z`);
  d2.setDate(d2.getDate() + 2);
  const checkOutDate = d2.toISOString().split('T')[0];
  const randomPhone = `9822${String(timeSeed).slice(-6)}`;

  const walkinRes = await fetch(`${BASE_URL}/api/admin/reception/walkin`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      guest: {
        fullName: 'Santosh B. Jagtap',
        phone: randomPhone,
        email: 'santosh.jagtap@example.com',
        city: 'Pune',
        state: 'Maharashtra',
        idType: 'aadhaar',
        idNumber: '1234-5678-9012'
      },
      checkInDate,
      checkOutDate,
      roomTypeId: 'rt-deluxe-ac',
      roomNumber: '101',
      guestCount: 2,
      additionalGuests: [{ fullName: 'Sunita Jagtap', age: 48, gender: 'female' }],
      cashPaidPaise: 150000, // ₹1,500 advance cash
      paymentNotes: 'Advance payment collected at reception counter'
    })
  });

  const walkinData = await walkinRes.json();
  assert(walkinRes.ok, `Walkin booking must succeed: ${JSON.stringify(walkinData)}`);
  assert(walkinData.booking, 'Walkin booking must be returned');
  assert.strictEqual(walkinData.booking.assignedRoomNumber, '101');
  assert(walkinData.cashTransaction, 'Cash transaction record must be created');
  assert.strictEqual(walkinData.cashTransaction.transactionType, 'payment');
  assert.strictEqual(walkinData.booking.paidAmountPaise, 150000);
  assert(walkinData.booking.remainingBalancePaise > 0);
  assert.strictEqual(walkinData.booking.paymentStatus, 'partially_paid');
  assert(walkinData.cashTransaction.receiptNumber.startsWith('RCP-ARN-'));
  const bookingRef = walkinData.booking.bookingReference;
  console.log(`✔ Walk-in booking confirmed: Ref ${bookingRef}, Receipt ${walkinData.cashTransaction.receiptNumber}`);

  // 2. Record additional cash payment to clear the balance
  const remainingPaise = walkinData.booking.remainingBalancePaise;
  const payRes = await fetch(`${BASE_URL}/api/admin/reception/payments`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      bookingReference: bookingRef,
      amountPaise: remainingPaise,
      cashierName: 'Front Desk Rahul',
      notes: 'Cleared remaining balance'
    })
  });

  const payData = await payRes.json();
  assert.strictEqual(payRes.status, 200, `Payment must return 200: ${JSON.stringify(payData)}`);
  assert.strictEqual(payData.booking.paymentStatus, 'paid');
  assert.strictEqual(payData.booking.remainingBalancePaise, 0);
  assert(payData.cashTransaction.receiptNumber.startsWith('RCP-ARN-'));
  console.log(`✔ Additional cash payment recorded: ${payData.cashTransaction.receiptNumber}, Balance is now ₹0`);

  // 3. Issue authorized cash refund
  const refRes = await fetch(`${BASE_URL}/api/admin/reception/refunds`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      bookingReference: bookingRef,
      amountPaise: 50000, // ₹500 refund
      reason: 'Devotee temple visit shortened by 1 day',
      authorizedBy: 'Yuvaraj Malave (Owner)'
    })
  });

  const refData = await refRes.json();
  assert.strictEqual(refRes.status, 200, `Refund must return 200: ${JSON.stringify(refData)}`);
  assert(refData.refundTransaction.receiptNumber.startsWith('REF-ARN-'));
  assert.strictEqual(refData.booking.paymentStatus, 'partially_refunded');
  console.log(`✔ Authorized refund processed: Voucher ${refData.refundTransaction.receiptNumber}, Status: partially_refunded`);

  // 4. Daily cash register report
  const todayStr = new Date().toISOString().split('T')[0];
  const regRes = await fetch(`${BASE_URL}/api/admin/reception/cash-register?date=${todayStr}`, {
    headers: { 'Cookie': authCookie }
  });
  const regData = await regRes.json();
  assert.strictEqual(regRes.status, 200);
  assert(regData.summary.totalPaymentsPaise >= 150000);
  assert(regData.summary.totalRefundsPaise >= 50000);
  assert(regData.summary.netCashPaise > 0);
  console.log(`✔ Cash register daily report verified: Inflow ₹${regData.summary.totalPaymentsPaise/100}, Outflow ₹${regData.summary.totalRefundsPaise/100}, Net ₹${regData.summary.netCashPaise/100}`);

  // 5. Open and close cash shift
  const openShiftRes = await fetch(`${BASE_URL}/api/admin/reception/cash-shifts`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      action: 'open',
      openingFloatPaise: 250000
    })
  });
  const openShiftData = await openShiftRes.json();
  assert.strictEqual(openShiftRes.status, 200);
  assert(openShiftData.shift.openingFloatPaise > 0);
  assert.strictEqual(openShiftData.shift.status, 'open');

  const closeShiftRes = await fetch(`${BASE_URL}/api/admin/reception/cash-shifts`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      action: 'close',
      shiftId: openShiftData.shift.id,
      closingActualCashPaise: 350000,
      notes: 'Handover complete'
    })
  });
  const closeShiftData = await closeShiftRes.json();
  assert.strictEqual(closeShiftRes.status, 200, `Close shift failed: ${JSON.stringify(closeShiftData)}`);
  assert.strictEqual(closeShiftData.shift.status, 'closed');
  console.log('✔ Shift cycle tested: Open Float ₹2,500 -> Closed with reconciliation notes');

  // -------------------------------------------------------------------------
  // FEATURE TWO: COMPLETE ADMIN-POWERED COUPON SYSTEM
  // -------------------------------------------------------------------------
  console.log('\n--- Testing Feature 2: Admin-Powered Coupon System ---');

  // 1. Create a promo coupon
  const testCouponCode = `DSH${Date.now().toString().slice(-5)}`;
  const cCreateRes = await fetch(`${BASE_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      code: testCouponCode,
      description: '25% discount for Pandharpur pilgrimage devotees',
      discountType: 'percentage',
      discountValue: 25,
      maxDiscountAmountPaise: 50000, // ₹500 cap
      minBookingAmountPaise: 150000, // ₹1,500 min spend
      maxRedemptions: 50,
      maxRedemptionsPerCustomer: 1,
      eligibleCustomerType: 'all',
      isActive: true
    })
  });
  const cCreateData = await cCreateRes.json();
  assert.strictEqual(cCreateRes.status, 201);
  console.log(`✔ Created coupon ${testCouponCode} (25% off up to ₹500 on ₹1500+ spend)`);

  // 2. Validate coupon below minimum spend -> expect valid: false
  const valLowRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      couponCode: testCouponCode,
      bookingAmountPaise: 100000, // ₹1,000 (below ₹1,500)
      customerPhone: '9822012345'
    })
  });
  const valLowData = await valLowRes.json();
  assert.strictEqual(valLowData.valid, false);
  assert(valLowData.error.includes('Minimum booking'));
  console.log(`✔ Correctly rejected coupon when spend was below threshold: "${valLowData.error}"`);

  // 3. Validate coupon with eligible spend -> expect valid: true with cap
  const valOkRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      couponCode: testCouponCode,
      bookingAmountPaise: 300000, // ₹3,000 -> 25% is ₹750, capped at ₹500
      customerPhone: '9822012345'
    })
  });
  const valOkData = await valOkRes.json();
  assert.strictEqual(valOkData.valid, true);
  assert.strictEqual(valOkData.discountPaise, 50000);
  console.log(`✔ Coupon validated with discount cap applied: Discount ₹${valOkData.discountPaise/100}`);

  // -------------------------------------------------------------------------
  // FEATURE THREE: AUTOMATIC EMAIL COUPON AFTER CHECKOUT
  // -------------------------------------------------------------------------
  console.log('\n--- Testing Feature 3: Automatic Email Coupon After Checkout ---');

  // 1. Configure campaign
  const campRes = await fetch(`${BASE_URL}/api/admin/marketing/campaign`, {
    method: 'PUT',
    headers: staffHeaders,
    body: JSON.stringify({
      isEnabled: true,
      name: 'Pilgrim Return Devotee Gift',
      emailSubject: 'Thank You for Staying With Us at Pandharpur! Special Gift 🎁',
      emailBodyIntro: 'We hope your darshan was blessed.',
      discountType: 'percentage',
      discountValue: 15,
      validityDays: 60,
      minBookingAmountPaise: 100000,
      generateUniqueCodePerCustomer: true
    })
  });
  const campData = await campRes.json();
  assert.strictEqual(campRes.status, 200);
  console.log(`✔ Post-checkout campaign configured (15% return discount valid 60 days)`);

  // 2. Perform checkout on walkin booking -> marks checked_out and triggers loyalty offer
  const coRes = await fetch(`${BASE_URL}/api/admin/bookings`, {
    method: 'PATCH',
    headers: staffHeaders,
    body: JSON.stringify({
      bookingId: walkinData.booking.id,
      status: 'checked_out'
    })
  });
  const coData = await coRes.json();
  assert.strictEqual(coRes.status, 200);
  assert.strictEqual(coData.booking.status, 'checked_out');
  console.log(`✔ Checkout succeeded: status = checked_out`);

  // Check outbox logs
  const outboxRes = await fetch(`${BASE_URL}/api/admin/marketing/campaign`, {
    headers: { 'Cookie': authCookie }
  });
  const outboxData = await outboxRes.json();
  const notif = outboxData.notifications.find(n => n.bookingReference === walkinData.booking.bookingReference);
  assert(notif, 'Outbox notification record must exist for checkout');
  assert(notif.couponCode.startsWith('RETURN-'), 'Coupon must follow RETURN- pattern');
  console.log(`✔ Outbox record created with return coupon ${notif.couponCode} for ${notif.recipientName || notif.customerName}`);

  // -------------------------------------------------------------------------
  // FEATURE FOUR: ADVANCED CUSTOMER DATABASE & ID DOCUMENT MANAGEMENT
  // -------------------------------------------------------------------------
  console.log('\n--- Testing Feature 4: Guest Database & ID Documents ---');

  // 1. Create a customer profile
  const custPhone1 = `9422${String(Date.now()).slice(-6)}`;
  const custRes = await fetch(`${BASE_URL}/api/admin/customers`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      fullName: 'Mahadev Govind Ranade',
      phone: custPhone1,
      email: 'mgranade@example.com',
      city: 'Nashik',
      state: 'Maharashtra',
      vipStatus: true,
      notes: 'Visiting with 6 family members for Kartiki Ekadashi'
    })
  });
  const custData = await custRes.json();
  assert.strictEqual(custRes.status, 201);
  const customerId = custData.customer.id;
  assert(customerId.startsWith('CUST-'));
  console.log(`✔ Guest profile registered: ${custData.customer.fullName} (${customerId})`);

  // 2. Upload ID document via multipart form
  const form = new FormData();
  form.append('documentType', 'aadhaar');
  form.append('documentNumber', '9988-7766-5544');
  const blob = new Blob(['%PDF-1.4 Fake PDF Content for Test'], { type: 'application/pdf' });
  form.append('file', blob, 'aadhaar_card.pdf');

  const docRes = await fetch(`${BASE_URL}/api/admin/customers/${customerId}/documents`, {
    method: 'POST',
    headers: { 'Cookie': authCookie },
    body: form
  });
  const docData = await docRes.json();
  assert(docRes.ok, `Doc upload failed: ${JSON.stringify(docData)}`);
  const maskedVal = docData.document.documentNumberMasked || docData.document.maskedNumber;
  assert(maskedVal && maskedVal.includes('5544'), 'Must mask number keeping last digits visible');
  console.log(`✔ ID Document stored safely in vault: ${docData.document.maskedNumber} (${docData.document.documentType})`);

  // 3. Verify document by staff
  const vDocRes = await fetch(`${BASE_URL}/api/admin/customers/${customerId}/documents/${docData.document.id}`, {
    method: 'PATCH',
    headers: staffHeaders,
    body: JSON.stringify({ status: 'verified' })
  });
  const vDocData = await vDocRes.json();
  assert.strictEqual(vDocRes.status, 200);
  assert.strictEqual(vDocData.document.verificationStatus, 'verified');
  console.log(`✔ Document verified by authorized staff: status = verified`);

  // 4. Merge duplicate customer profiles
  const custPhone2 = `9422${String(Date.now() + 1).slice(-6)}`;
  const cust2Res = await fetch(`${BASE_URL}/api/admin/customers`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      fullName: 'M. G. Ranade',
      phone: custPhone2,
      city: 'Nashik',
      notes: 'Old duplicate profile'
    })
  });
  const cust2Data = await cust2Res.json();

  const mergeRes = await fetch(`${BASE_URL}/api/admin/customers/merge`, {
    method: 'POST',
    headers: staffHeaders,
    body: JSON.stringify({
      primaryCustomerId: customerId,
      secondaryCustomerId: cust2Data.customer.id
    })
  });
  const mergeData = await mergeRes.json();
  assert.strictEqual(mergeRes.status, 200);
  const mergedCust = mergeData.customer || mergeData.primaryCustomer;
  assert.strictEqual(mergedCust.id, customerId);
  console.log(`✔ Customer duplicate merge verified: ${cust2Data.customer.id} merged into ${customerId}`);

  // -------------------------------------------------------------------------
  // FEATURE FIVE: ADVANCED EXCEL IMPORT AND EXPORT
  // -------------------------------------------------------------------------
  console.log('\n--- Testing Feature 5: Advanced Excel Import & Export ---');

  // 1. Test Excel binary download for all 5 datasets
  for (const type of ['customers', 'reservations', 'payments', 'cash_ledger', 'coupons']) {
    const expRes = await fetch(`${BASE_URL}/api/admin/data/export?type=${type}`, {
      headers: { 'Cookie': authCookie }
    });
    assert.strictEqual(expRes.status, 200, `Export ${type} must return 200`);
    const contentType = expRes.headers.get('content-type');
    assert(
      contentType.includes('spreadsheetml') || contentType.includes('application/octet-stream') || contentType.includes('excel'),
      `Content type must indicate spreadsheet: ${contentType}`
    );
    const buf = await expRes.arrayBuffer();
    assert(buf.byteLength > 500, `Buffer must be valid binary workbook: ${buf.byteLength} bytes`);
    console.log(`✔ Downloaded valid .xlsx binary for "${type}" (${buf.byteLength} bytes)`);
  }

  // 2. Download sample import template
  const tmplRes = await fetch(`${BASE_URL}/api/admin/data/template?type=customers`, {
    headers: { 'Cookie': authCookie }
  });
  assert.strictEqual(tmplRes.status, 200);
  const tmplBuf = await tmplRes.arrayBuffer();
  assert(tmplBuf.byteLength > 500);
  console.log(`✔ Official customer Excel import template verified (${tmplBuf.byteLength} bytes)`);

  console.log('\n=====================================================');
  console.log('  ALL 5 ADVANCED BUSINESS FEATURES TESTED & PASSED!  ');
  console.log('=====================================================\n');
}

runMasterVerification().catch((err) => {
  console.error('\n❌ MASTER VERIFICATION FAILED:', err);
  process.exit(1);
});
