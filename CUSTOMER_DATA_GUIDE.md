# Customer Database & Government ID Management Guide

**Aarunodya Residency Bhakt Niwas — Devotee CRM & Compliance Manual**

---

## 1. Overview

Indian hospitality law and local Pandharpur police regulations require lodges to collect and preserve verified identification documents for all staying guests. Aarunodya Residency provides an encrypted, authenticated customer database and document vault ensuring full legal compliance while preserving devotee privacy.

---

## 2. Devotee Customer Directory

Access: **Guest Database & IDs** (`/admin/customers`)

### Features:
- **Instant Search:** Search across all historical records by devotee name, 10-digit mobile number, email, or hometown.
- **Verification Badges:** Shows at a glance how many documents on file have been approved by staff (e.g., `1/1 Verified`).
- **Devotee Metrics:** Shows visit frequency, lifetime spend, and VIP badges for trustees or temple committee members.

---

## 3. Devotee Profile Folio

Access: Click **Open Folio** on any customer row (`/admin/customers/[id]`).

### Folio Sections:
1. **Devotee Details Card:** Legal name, primary & alternate phone numbers, email address, residential address, city, state, preferred language (Marathi, Hindi, Kannada, Telugu, English), and staff notes.
2. **Identity Document Vault:**
   - Displays all uploaded Aadhaar, Voter ID, Passport, or Driving License records.
   - Shows masked ID numbers (`XXXX-XXXX-4567`) to protect devotee privacy.
   - Authorized staff can click **Approve** or **Reject** to verify physical identity verification.
   - Click **Download File** to securely stream the original document image or PDF.
3. **Historical Stay Folio:** Chronological record of all past and active reservations booked by this devotee, complete with dates, physical room numbers, tariffs paid, and one-click receipt links.

---

## 4. Uploading Identity Documents

1. On the Devotee Folio, click **Upload ID Document**.
2. Select Document Type: Aadhaar Card, Voter ID, Driving License, or Passport.
3. Enter Document Number (e.g. 12-digit Aadhaar).
4. Select the scan or camera photo (JPG, PNG, WebP, or PDF up to 5MB).
5. Click **Upload & Save to Vault**.
6. The file is saved to the private storage directory `data/secure_documents/` with a UUID filename.

---

## 5. Duplicate Profile Detection & Merging

When devotees book over the phone or walk in under slightly different spellings or phone numbers, multiple profiles may be created.
1. In the customer directory, click **Merge Duplicates**.
2. Select the **Primary Profile (To Keep)**.
3. Select the **Secondary Profile (To Merge & Archive)**.
4. Click **Confirm Profile Merge**.
5. The system automatically:
   - Re-associates all past bookings to the primary profile.
   - Transfers all government ID documents to the primary vault.
   - Recalculates total visits and lifetime spend in integer paise.
   - Safely removes the duplicate profile and logs an entry in the system audit trail.
