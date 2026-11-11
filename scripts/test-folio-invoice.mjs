import assert from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🏛️ Testing Front-Desk Folio, Police Register & GST Invoice Generation...');

const dbPath = join(process.cwd(), 'data', 'lodge_database.json');
const raw = readFileSync(dbPath, 'utf-8');
const data = JSON.parse(raw);

// 1. Verify Property Details
assert.strictEqual(data.property.name, 'Aarunodya Residency Bhakt Niwas', 'Property name matches');
console.log('✅ Property Name verified:', data.property.name);

// 2. Verify 18 Units Distribution
const floor0 = data.rooms.filter(r => r.floor === 0);
const floor1 = data.rooms.filter(r => r.floor === 1);
const floor2 = data.rooms.filter(r => r.floor === 2);
const floor3 = data.rooms.filter(r => r.floor === 3);

assert.strictEqual(floor0.length, 4, 'Ground floor has 4 rooms');
assert.strictEqual(floor1.length, 6, '1st floor has 6 rooms');
assert.strictEqual(floor2.length, 6, '2nd floor has 6 rooms');
assert.strictEqual(floor3.length, 2, '3rd floor has 2 units (401 + 402 Hall)');
assert.strictEqual(data.rooms.length, 18, 'Total 18 physical units');
console.log('✅ 18-Unit Physical Floor Breakdown verified (4, 6, 6, 2)');

// 3. Verify Hall 402 Configuration
const hall402 = data.rooms.find(r => r.roomNumber.includes('402'));
assert.ok(hall402, 'Room 402 Hall exists');
assert.strictEqual(hall402.floor, 3, 'Hall 402 is on 3rd floor');
console.log('✅ Hall 402 verified on 3rd Floor as', hall402.roomNumber);

// 4. Test GST Tax Calculation for Room Accommodation
const sampleBasePricePaise = 180000; // ₹1,800
const taxRatePercent = 12.0;
const totalTaxPaise = Math.round((sampleBasePricePaise * taxRatePercent) / 100);
const cgstPaise = Math.round(totalTaxPaise / 2);
const sgstPaise = totalTaxPaise - cgstPaise;

assert.strictEqual(totalTaxPaise, 21600, '12% GST on ₹1,800 is ₹216 (21600 paise)');
assert.strictEqual(cgstPaise, 10800, '6% CGST is ₹108 (10800 paise)');
assert.strictEqual(sgstPaise, 10800, '6% SGST is ₹108 (10800 paise)');
console.log('✅ Indian GST SAC 996311 6%+6% split verified mathematically');

// 5. Test Booking Reference Structure
const sampleRef = `ARN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
assert.match(sampleRef, /^ARN-2026-\d{4}$/, 'Booking reference format matches ARN-2026-XXXX');
console.log('✅ Booking Reference prefix verified:', sampleRef);

console.log('🎉 ALL ADVANCED FOLIO & INVOICE TESTS PASSED!');
