# Requirements and Business Assumptions

**Property:** Aarunodya Residency Bhakt Niwas  
**Location:** 1563 Ghongade Galli, Nath Chowk, Pandharpur, Maharashtra – 413304  
**Host / Management:** Yuvaraj Malave (Primary: +91 85300 00820, +91 91724 64746, +91 88012 42005)  
**Capacity:** 18 physical units across 4 floors (including 3rd-floor 20-bed pilgrim hall: Room 402)

---

## 1. Executive Summary & Mission Scope

Aarunodya Residency is a premier hospitality property situated near the sacred Shri Vitthal-Rukmini Mandir in Pandharpur, Maharashtra. The system is designed to provide an enterprise-grade Property Management System (PMS) and devotee booking platform tailored for high-volume temple pilgrimage rushes, Ekadashi peak periods, and routine spiritual tourism.

The system encompasses five advanced core business modules:
1. **Reception Cash Booking System:** Full walk-in reservation desk with cash drawer reconciliation and official receipts.
2. **Admin-Powered Coupon & Promotions Engine:** Server-side discount calculation in integer paise with usage capping and concurrency safety.
3. **Automated Post-Checkout Loyalty Email Engine:** Idempotent, transaction-hooked coupon delivery via Resend API to encourage return visits.
4. **Devotee CRM & Government ID Vault:** Encrypted, authenticated storage for police-compliant identification documents (Aadhaar, Passport, DL) with audit logging.
5. **Excel Import & Export Engine:** Binary `.xlsx` generation using SheetJS for accounting compliance and guided batch pilgrim roster ingestion.

---

## 2. Core Business Requirements

### 2.1 Front Desk & Cash Operations
- **Physical Room Allocation:** Strict mapping to the 18 physical units:
  - Ground Floor: 101, 102, 103, 104
  - 1st Floor: 201, 202, 203, 204, 205, 206
  - 2nd Floor: 301, 302, 303, 304, 305, 306
  - 3rd Floor: 401, 402 (Bhakt Niwas Hall, capacity 20)
- **Zero Double-Bookings:** Double-booking prevention enforced via calendar interval locking (`startA < endB && endA > startB`), treating check-in as inclusive and check-out as exclusive.
- **Cash Accountability:**
  - Cash bookings can be confirmed with Full Payment, Partial Advance, or Pay at Desk.
  - Every transaction generates a tamper-evident receipt voucher (`RCP-ARN-XXXX`).
  - Cash refunds require manager/admin authorization and generate refund vouchers (`REF-ARN-XXXX`).
  - Daily drawer cash shifts track opening float, net collections, and closing handoff counts.

### 2.2 Coupon & Revenue Management
- **Monetary Precision:** All amounts are processed strictly in minor integer paise (₹1.00 = 100 paise) to avoid floating-point rounding errors.
- **Validation Rules:** Validated exclusively on the server against start/end dates, minimum booking value, maximum discount caps, redemption limits per customer, and eligible room types.
- **Redemption Ledger:** Concurrency-safe ledger to prevent duplicate redemptions during simultaneous booking holds.

### 2.3 Post-Checkout Devotee Retention
- **Automated Hook:** When front-desk staff marks a reservation as `checked_out`, the system generates a unique return discount coupon (e.g. `RETURN-XXXX`).
- **Idempotency:** Re-checking out or refreshing the folio page never duplicates emails or generates superfluous coupon records.
- **Outbox Trail:** Failed email dispatches (e.g. temporary SMTP downtime) are captured in the notification log with staff retry capabilities.

### 2.4 Devotee CRM & Police Compliance
- **Identity Storage:** Uploaded identity files (Aadhaar, Passport, Voter ID, DL) are stored outside public web roots in a secure directory (`data/secure_documents/`).
- **Access Control:** Files are streamed only through authenticated endpoints (`/api/admin/documents/[id]`) with role checks and access audit logs.
- **Masking:** Public and staff listing displays mask sensitive identification numbers (e.g., `XXXX-XXXX-4567`).
- **Profile Consolidation:** Duplicate entries resulting from different family bookings can be merged safely into a single master profile without data loss.

### 2.5 Accounting & Data Mobility
- **True Excel Format:** Exports generate valid `.xlsx` binary files containing formulas, headers, and clean monetary representations.
- **Batch Import:** Allows front-desk staff to import offline pilgrim registers with configurable duplicate strategies (`update`, `skip`, `fail`).

---

## 3. Assumptions & Default Operational Policies

1. **Check-In / Check-Out Timings:**
   - Standard Check-In: 12:00 PM (Noon)
   - Standard Check-Out: 11:00 AM
   - 24-hour flexibility is available for walk-in pilgrims arriving late from Solapur/Kurduvadi railway stations.
2. **Indian Hospitality GST:**
   - Under ₹1,000/night: 0% GST (Exempted under Indian Hospitality GST rules).
   - ₹1,000 to ₹7,499/night: 12% GST (6% CGST + 6% SGST under SAC code 996311).
3. **Session Expiry:**
   - Admin and front-desk staff sessions remain valid for 7 days via HMAC-SHA256 cryptographically signed HTTP-only cookies.
4. **Serverless & Local Persistence:**
   - In containerized or local environments, data persists to `data/lodge_database.json`.
   - In serverless environments (AWS Lambda / Vercel), the repository automatically migrates and falls back to `/tmp/lodge_database.json` and `/tmp/secure_documents/` with cryptographic multi-lambda recovery tokens.

