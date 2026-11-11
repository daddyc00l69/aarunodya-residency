# Aarunodya Residency Bhakt Niwas - Production Deployment Guide

This document details the complete step-by-step procedure to deploy the **Aarunodya Residency Bhakt Niwas Booking & Property Management System (PMS)** to production using **Vercel**, **Supabase (PostgreSQL)**, **Razorpay**, and **Resend**.

---

## 1. Architecture Overview

- **Frontend & API Routes:** Next.js 16 App Router on Vercel Serverless infrastructure.
- **Database:** Managed PostgreSQL via Supabase with Row Level Security (RLS) and connection pooling (`ap-south-1` Mumbai region for lowest latency in Maharashtra).
- **Payment Processing:** Razorpay Payment Gateway with server-side HMAC-SHA256 signature verification and idempotent webhook processing.
- **Transactional Emails:** Resend API for automated HTML booking vouchers and payment receipts.
- **QR Code Scanning:** Client-rendered dynamic QR badge for instant front-desk counter scan-to-verify.

---

## 2. Supabase PostgreSQL Setup

### Step 2.1: Create Project
1. Log in to [Supabase](https://supabase.com).
2. Click **New Project**, name it `aarunodya-residency`, select `ap-south-1` (Mumbai, India).
3. Set a strong database password.

### Step 2.2: Run SQL Schema Migrations
1. In the Supabase dashboard, navigate to **SQL Editor**.
2. Open `supabase/migrations/20261111000000_lodge_initial_schema.sql`.
3. Paste the SQL script and click **Run**.
4. Verify the 9 normalized tables: `properties`, `room_types`, `rooms`, `guests`, `bookings`, `booking_rooms`, `payments`, `staff_users`, and `audit_logs`.

---

## 3. Razorpay Payment Gateway Configuration

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Under **Settings > API Keys**, retrieve:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` (e.g. `rzp_test_TrHgzKz5hTub5i` or `rzp_live_...`)
   - `RAZORPAY_KEY_SECRET`
3. Under **Settings > Webhooks**:
   - Webhook URL: `https://your-domain.com/api/webhooks/razorpay`
   - Active Events:
     - `order.paid`
     - `payment.captured`
     - `payment.failed`
     - `refund.processed`

---

## 4. Resend Transactional Email Setup

1. In [Resend Dashboard](https://resend.com):
2. Add verified domain (e.g., `devtushar.uk` or `aarunodya.com`).
3. Generate API Key: `RESEND_API_KEY` (e.g., `re_123456789_abcdef...`).
4. Configure sender address: `RESEND_FROM_EMAIL=reservations@yourdomain.com`.

---

## 5. Deploying to Vercel

### Step 5.1: Connect Repository
1. Push the repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), click **Add New > Project** and select `lodge-management-system`.

### Step 5.2: Configure Environment Variables
Add the following in **Settings > Environment Variables**:

```ini
# Application
NEXT_PUBLIC_APP_URL="https://aarunodya-residency.vercel.app"
ADMIN_SESSION_SECRET="aarunodya_residency_bhakt_niwas_secret_2026_super_secure"

# Supabase PostgreSQL (Production)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Razorpay Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"

# Resend Transactional Emails
RESEND_API_KEY="re_your_resend_api_key_here"
RESEND_FROM_EMAIL="reservations@devtushar.uk"
```

### Step 5.3: Deploy & Verify
1. Click **Deploy**.
2. Verify all routes:
   - `/` (Homepage)
   - `/rooms` (Floor directory & booking catalog)
   - `/darshan` (Pandharpur Darshan Guide & Aarti Timings)
   - `/checkout` (15-min hold checkout & Razorpay modal)
   - `/booking/lookup` (Self-service guest retrieval)
   - `/booking/invoice/[reference]` (GST Tax Invoice)
   - `/admin` (Executive PMS operations deck)

---

## 6. Domain & SSL Setup

1. In Vercel Project Settings > **Domains**, add custom domain (e.g., `aarunodyaresidency.com`).
2. Add DNS records at domain registrar:
   - `CNAME` for `www` pointing to `cname.vercel-dns.com`
   - `A` record for apex domain pointing to `76.76.21.21`
3. Vercel automatically provisions and auto-renews Let's Encrypt SSL certificates.
