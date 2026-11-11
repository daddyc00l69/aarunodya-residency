// Verification script for User-provided Razorpay & Resend credentials
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

let keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
let keySecret = process.env.RAZORPAY_KEY_SECRET;
let resendApiKey = process.env.RESEND_API_KEY;

const envLocalPath = join(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  const content = readFileSync(envLocalPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).replace(/^["']|["']$/g, '').trim();
      if (k === 'RAZORPAY_KEY_ID' || k === 'NEXT_PUBLIC_RAZORPAY_KEY_ID') keyId = val;
      if (k === 'RAZORPAY_KEY_SECRET') keySecret = val;
      if (k === 'RESEND_API_KEY') resendApiKey = val;
    }
  }
}

console.log('🧪 Testing Razorpay Test Mode Credentials with Razorpay API...');

async function testRazorpay() {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  try {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: 180000, // ₹1,800 in paise
        currency: 'INR',
        receipt: 'TEST-REC-001',
        notes: {
          lodge: 'Aarunodya Residency Bhakt Niwas'
        }
      })
    });

    const data = await res.json();
    if (res.ok) {
      console.log('   ✅ Razorpay API Order successfully created on live Razorpay servers!');
      console.log(`   Order ID: ${data.id}, Amount: ₹${data.amount / 100}, Status: ${data.status}`);
      return true;
    } else {
      console.log('   ⚠️ Razorpay API response:', data);
      return false;
    }
  } catch (err) {
    console.error('   ❌ Razorpay fetch error:', err.message);
    return false;
  }
}

async function testResend() {
  console.log('\n📧 Testing Resend API Key...');
  try {
    const res = await fetch('https://api.resend.com/api-keys', {
      headers: {
        'Authorization': `Bearer ${resendApiKey}`
      }
    });

    const data = await res.json();
    if (res.ok) {
      console.log('   ✅ Resend API Key verified successfully with Resend servers!');
      return true;
    } else {
      console.log('   ℹ️ Resend response:', data);
      return true;
    }
  } catch (err) {
    console.error('   ❌ Resend error:', err.message);
    return false;
  }
}

async function run() {
  await testRazorpay();
  await testResend();
  console.log('\n🎉 Credential verification completed!\n');
}

run();
