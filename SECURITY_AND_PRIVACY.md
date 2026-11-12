# Security, Authentication and Privacy Architecture

**Aarunodya Residency Bhakt Niwas PMS**

---

## 1. Authentication & Session Security

Staff and administrator access is secured via cryptographic session tokens:
- **Signing Algorithm:** HMAC-SHA256 with key derivation from `ADMIN_SESSION_SECRET`.
- **Cookie Policy:**
  - Name: `lodge_staff_session`
  - Flags: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in production.
  - Expiration: Rolling 7-day expiration with timestamp verification.
- **Tamper Resistance:** Any payload modification or forged signature is immediately rejected with a 401 Unauthorized status.

---

## 2. Role-Based Access Control (RBAC)

The system enforces strict principle-of-least-privilege boundaries:
- `super_admin`: Unrestricted access across all operational, financial, coupon, and system settings.
- `manager`: Full front desk control, cash register shifts, coupon creation, and customer merge operations.
- `front_desk`: Walk-in registration, room allocation, cash collection, ID uploads, check-in/check-out.
- `accounts`: Financial reports, cash ledger reconciliation, invoice exports, refund issuance.
- `housekeeping`: Room status toggles (`clean`, `dirty`, `inspecting`, `maintenance`).

---

## 3. Devotee Government ID Document Security

To prevent data breaches and comply with Indian privacy standards:
1. **Isolated Storage:** Files are saved to `data/secure_documents/` (or `/tmp/secure_documents/` in serverless), strictly outside the `public/` web root. Direct static URL access is impossible.
2. **Authenticated File Streaming:** Files can only be downloaded via `GET /api/admin/documents/[id]`. The endpoint:
   - Validates that the request has an active, valid staff session.
   - Verifies the user has appropriate permissions (`super_admin`, `manager`, `front_desk`).
   - Streams the file with proper `Content-Type` headers.
   - Appends an audit trail entry logging the staff member ID, timestamp, and accessed document ID.
3. **Number Masking:** Government identification numbers (Aadhaar, Passport, DL) are stored and displayed in masked format (e.g. `XXXX-XXXX-4567`).

---

## 4. Financial Integrity & Zero-Trust Validation

1. **Integer Paise Architecture:** All monetary amounts (tariffs, discounts, cash payments, refunds) are handled as 64-bit integer minor units (paise). Floating point calculations are strictly avoided.
2. **Server-Side Coupon Enforcement:** Clients cannot dictate discount values. All discounts are re-computed and capped on the server during the booking hold lifecycle.
3. **Cash Accountability:** A reservation is never marked as paid simply by clicking a button. A validated `CashTransaction` with an official receipt number (`RCP-ARN-XXXX`) is required.
4. **Manager-Authorized Refunds:** Cash refunds require manager authorization and PIN verification, preventing unauthorized cash drawer withdrawals.

---

## 5. Audit Logging

Every sensitive operational and business action is persisted to the immutable audit log:
- Staff logins and sign-outs
- Physical walk-in creations and cash transactions
- Coupon creations, modifications, and deletions
- Post-checkout campaign settings updates
- Devotee profile merges and identity document views
- Excel dataset exports
