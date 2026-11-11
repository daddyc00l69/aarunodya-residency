# Aarunodya Residency Bhakt Niwas • Pandharpur
## Production Lodge Booking & Property Management System (PMS)

A comprehensive, production-ready, full-stack Lodge Booking and Management System designed and built for **Aarunodya Residency Bhakt Niwas** (1563 Ghongade Galli, Nath Chowk, Pandharpur, Maharashtra - 413304).

Managed by: **Yuvaraj Malave** (📞 8530000820 / 9172464746 / 8801242005)

---

## 🌟 Key Features

### Apple-Inspired Minimalist Guest Experience
- **Apple.com Luminous Aesthetic:** Pure white (`#ffffff`), light-gray containers (`#f5f5f7`), crisp black typography (`#1d1d1f`), and signature Apple blue accents (`#0071e3`).
- **Interactive 18-Unit Floor Directory:** Visual floor-by-floor breakdown of all 18 units:
  - **Ground Floor (Floor 0):** Rooms `101`, `102`, `103`, `104` (Zero stairs, ideal for senior devotees)
  - **1st Floor (Floor 1):** Rooms `201`, `202`, `203`, `204`, `205`, `206` (Lift access, Deluxe AC & Family Suite)
  - **2nd Floor (Floor 2):** Rooms `301`, `302`, `303`, `304`, `305`, `306` (Quiet level with elevator access)
  - **3rd Floor (Floor 3):** Room `401` & Room `402` (**Large Group Bhakt Niwas Hall** for up to 15–20 devotees with multiple western bathrooms)
- **Real-Time Dynamic Availability Engine:** Strictly checks availability $[CheckIn, CheckOut)$ where check-in is inclusive (12:00 PM) and check-out is exclusive (11:00 AM) to allow seamless room turnaround.
- **15-Minute Temporary Hold Engine:** Concurrency-safe checkout locks room inventory while guests complete payment.
- **Live Razorpay Payment Gateway:** Integrated test mode credentials (`rzp_test_TrHgzKz5hTub5i`) with HMAC-SHA256 signature verification.
- **Live Resend Email Delivery:** Integrated transactional email delivery for automated booking confirmation vouchers and tax receipts.
- **Digital Stay Voucher with QR Code:** Printable official voucher with embedded QR code (`BookingQrCode.tsx`) for instant scan-to-verify at the reception desk.
- **Government-Compliant GST Tax Invoice:** Full tax invoice at `/booking/invoice/[reference]` with SAC Code `996311` (Accommodation), 6% CGST + 6% SGST, authorized signatory, and print formatting.
- **Dedicated Pandharpur Darshan Guide:** `/darshan` route featuring complete temple schedule (Kakad Aarti to Shej Aarti), Padsparsh & Mukh Darshan advice, Chandrabhaga River Ghat snan guide, and transit directions from Pandharpur Railway Station (PVR) and ST Bus Stand.
- **WhatsApp Share & Instant Host Calling:** 1-click WhatsApp booking summary share and floating contact pill for direct contact with Yuvaraj Malave.

### Staff Administrative & PMS Operations
- **Role-Based Access Control (RBAC):** `super_admin` (Yuvaraj Malave), `manager` (Nitin Shinde), `front_desk`, and `housekeeping`.
- **Executive Operations Deck:** Real-time occupancy %, revenue ledger, today's arrivals, departures, and dirty rooms.
- **Master Reservations Desk:** Filter by status, search by name/reference, execute check-ins/check-outs, and open guest folios.
- **Devotee Police Register & ID Proof Recording:** Staff can record Aadhaar Card / Voter ID / Driving License numbers during check-in as required by Maharashtra police regulations.
- **Front-Desk Walk-In Engine:** Rapid reservation creation modal for offline / telephone bookings with instant room allocation.
- **14-Day Visual Room Availability Matrix:** Grid view across all 18 physical units for occupancy planning.
- **Turnover & Housekeeping Queue:** 1-click status updates (`Clean`, `Dirty`, `Inspecting`, `Maintenance`) with inline maintenance notes modal.
- **Financial Ledger & CSV Export:** Export complete transactional records to CSV.
- **Lodge Policies & Settings:** Check-in/out timings, 12% GST rules, and staff management.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack, TypeScript, React 19)
- **Styling:** Tailwind CSS v4 (Apple Clean, luminous minimalism)
- **Icons:** Lucide React
- **Validation:** Zod schemas
- **QR Code:** `qrcode` library for dynamic scan-to-verify vouchers
- **Database:** Normalized PostgreSQL schema with Supabase migrations (`supabase/migrations/`) + embedded thread-safe transactional JSON repository (`src/lib/db/repository.ts`)
- **Payments:** Razorpay Orders API + HMAC-SHA256 verification
- **Emails:** Resend API
- **Currency Handling:** Strict integer minor units (`paise`, e.g. ₹1,800.00 = `180000`)
- **Testing:** Automated unit, concurrency, and invoice verification suites

---

## 🚀 Quickstart & Verification

### 1. Run Automated Test Suites
```bash
npm test
```
Runs:
1. `node scripts/test-engine.mjs` (Date overlap math, integer paise, Razorpay HMAC-SHA256 verification, hold expiry)
2. `node scripts/test-e2e.mjs` (18-room inventory breakdown, double-booking prevention under concurrency, 3rd floor Hall 402)
3. `node scripts/test-folio-invoice.mjs` (GST SAC 996311 6%+6% split, ARN-2026-XXXX reference generation, police register ID updates)

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🔑 Default Staff Credentials

Access the Staff PMS Portal at [http://localhost:3000/admin/login](http://localhost:3000/admin/login):

| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Yuvaraj Malave** | Owner / Super Admin | `yuvaraj@aarunodya.com` | `Aarunodya@2026` |
| **Nitin Shinde** | Operations Manager | `manager@aarunodya.com` | `Manager@2026` |
| **Ganesh Pawar** | Front Desk Lead | `frontdesk@aarunodya.com` | `Desk@2026` |
| **Sunil Jadhav** | Housekeeping Lead | `housekeeping@aarunodya.com` | `Clean@2026` |

*(1-click quick-fill buttons are provided on the login page for front-desk staff testing).*

---

## 📁 Repository Structure

```
├── data/
│   └── lodge_database.json            # Active transactional JSON persistence (18 units)
├── docs/
│   ├── DEPLOYMENT_GUIDE.md            # Vercel & Supabase deployment architecture
│   └── ADMIN_USER_GUIDE.md            # Staff & front-desk operational manual
├── public/
│   └── aarunodya-visiting-card.jpg    # Verified business visiting card reference
├── scripts/
│   ├── test-credentials.mjs           # Razorpay & Resend live API verification
│   ├── test-engine.mjs                # Core business logic unit tests
│   ├── test-e2e.mjs                   # 18-room concurrency & inventory tests
│   └── test-folio-invoice.mjs         # GST invoice & front-desk folio tests
├── src/
│   ├── app/
│   │   ├── page.tsx                   # Apple-clean homepage with 18-unit bento & reviews
│   │   ├── rooms/page.tsx             # Room catalog with floor directory selector
│   │   ├── darshan/page.tsx           # Pandharpur Mandir & pilgrimage guide
│   │   ├── checkout/page.tsx          # 15-minute hold timer & Razorpay modal
│   │   ├── booking/confirmation/      # Stay voucher with QR code & WhatsApp share
│   │   ├── booking/invoice/           # Official Indian GST Tax Invoice (SAC 996311)
│   │   ├── booking/lookup/            # Self-service reservation retrieval
│   │   └── admin/                     # Staff PMS (dashboard, calendar, rooms, reports, settings)
│   ├── components/                    # Apple-styled UI components & dialogs
│   └── lib/                           # Database repository, currency/date utils, services
└── supabase/
    └── migrations/                    # Production PostgreSQL DDL migrations
```
