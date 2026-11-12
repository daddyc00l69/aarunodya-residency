# Database Schema Documentation

**Aarunodya Residency Bhakt Niwas PMS**

---

## 1. Overview & Dual Persistence Model

The database architecture is designed with high adaptability:
1. **Production / Containerized Relational Storage:** Normalized PostgreSQL schema (`scripts/schema.sql`) featuring 12 relational tables, foreign key constraints, checks, and performance indexes.
2. **Serverless / Local File Storage:** Strongly-typed transactional JSON database (`data/lodge_database.json`) adhering to the `DatabaseSchema` TypeScript interface with automatic schema auto-migration upon application startup.

---

## 2. Table Specifications

### 2.1 `properties`
Stores physical lodge metadata.
- `id` (VARCHAR PRIMARY KEY, e.g. `prop-aarunodya-01`)
- `name` (VARCHAR, "Aarunodya Residency Bhakt Niwas")
- `address`, `city`, `state`, `postal_code`
- `primary_phone`, `alternate_phones` (ARRAY)
- `check_in_time`, `check_out_time`
- `gstin`, `sac_code`

### 2.2 `room_types`
Defines operational categories and floor allocations.
- `id` (VARCHAR PRIMARY KEY, e.g. `rt-deluxe-ac`)
- `name` (VARCHAR, "Deluxe A/C Room")
- `slug` (VARCHAR UNIQUE)
- `base_price_paise` (BIGINT, integer minor units)
- `extra_guest_fee_paise` (BIGINT)
- `base_occupancy`, `max_occupancy` (INT)
- `is_hall` (BOOLEAN)

### 2.3 `rooms` (18 Physical Units)
Physical inventory units across the 4 floors.
- `id` (VARCHAR PRIMARY KEY, e.g. `rm-101`)
- `room_type_id` (VARCHAR REFERENCES `room_types`)
- `room_number` (VARCHAR UNIQUE):
  - Ground Floor: `101`, `102`, `103`, `104`
  - 1st Floor: `201`, `202`, `203`, `204`, `205`, `206`
  - 2nd Floor: `301`, `302`, `303`, `304`, `305`, `306`
  - 3rd Floor: `401`, `402` (Bhakt Niwas Hall)
- `floor` (INT: 0 to 3)
- `housekeeping_status` (ENUM: `clean`, `dirty`, `inspecting`, `maintenance`)
- `is_operational` (BOOLEAN)

### 2.4 `customers` (CRM & Devotee Profiles)
Central devotee identity database.
- `id` (VARCHAR PRIMARY KEY, e.g. `CUST-4773`)
- `full_name` (VARCHAR)
- `phone` (VARCHAR UNIQUE/INDEXED)
- `alternate_phone` (VARCHAR)
- `email` (VARCHAR INDEXED)
- `city`, `state`, `postal_code`
- `preferred_language` (VARCHAR)
- `vip_status` (BOOLEAN)
- `total_visits` (INT DEFAULT 1)
- `total_spend_paise` (BIGINT DEFAULT 0)
- `notes` (TEXT)

### 2.5 `customer_documents` (Identity Vault)
Secure metadata for uploaded government identification documents.
- `id` (VARCHAR PRIMARY KEY, e.g. `doc-uuid`)
- `customer_id` (VARCHAR REFERENCES `customers` ON DELETE CASCADE)
- `document_type` (ENUM: `aadhaar`, `passport`, `driving_license`, `voter_id`, `other`)
- `document_number_masked` (VARCHAR, e.g. `XXXX-XXXX-4567`)
- `file_path` (VARCHAR, path in private vault)
- `original_file_name` (VARCHAR)
- `file_mime_type` (VARCHAR)
- `file_size_bytes` (INT)
- `verification_status` (ENUM: `pending`, `verified`, `rejected`)
- `verified_by_staff_id`, `verified_by_staff_name`
- `verified_at` (TIMESTAMP)

### 2.6 `bookings`
Complete stay folios and reservation contracts.
- `id` (VARCHAR PRIMARY KEY)
- `booking_reference` (VARCHAR UNIQUE, e.g. `ARN-202611-XXXX`)
- `customer_id` (VARCHAR REFERENCES `customers`)
- `check_in_date` (DATE)
- `check_out_date` (DATE)
- `assigned_room_id` (VARCHAR REFERENCES `rooms`)
- `assigned_room_number` (VARCHAR)
- `num_adults`, `num_children` (INT)
- `status` (ENUM: `pending_payment`, `confirmed`, `checked_in`, `checked_out`, `cancelled`)
- `payment_status` (ENUM: `unpaid`, `partially_paid`, `paid`, `partially_refunded`, `refunded`)
- `subtotal_paise`, `discount_paise`, `tax_paise`, `total_price_paise`, `amount_paid_paise`, `balance_due_paise` (BIGINT)

### 2.7 `cash_transactions` (Front Desk Ledger)
Audit trail of physical cash collected or refunded at the reception counter.
- `id` (VARCHAR PRIMARY KEY, e.g. `ctx-uuid`)
- `booking_id` (VARCHAR REFERENCES `bookings`)
- `booking_reference` (VARCHAR)
- `receipt_number` (VARCHAR UNIQUE, e.g. `RCP-ARN-XXXX` or `REF-ARN-XXXX`)
- `transaction_type` (ENUM: `payment`, `refund`, `deposit`, `withdrawal`)
- `amount_paise` (BIGINT)
- `cashier_id`, `cashier_name` (VARCHAR)
- `authorized_by_manager_name` (VARCHAR)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

### 2.8 `cash_shifts` (Drawer Shift Reconciliations)
Front desk drawer shifts and handover float tracking.
- `id` (VARCHAR PRIMARY KEY)
- `shift_date` (DATE)
- `status` (ENUM: `open`, `closed`)
- `opening_float_paise` (BIGINT)
- `closing_actual_cash_paise` (BIGINT)
- `expected_cash_paise` (BIGINT)
- `variance_paise` (BIGINT)
- `opened_by_staff_name`, `closed_by_staff_name`
- `notes` (TEXT)

### 2.9 `coupons` & `coupon_redemptions`
Promotional marketing and returning devotee discount engine.
- `coupons`:
  - `id` (VARCHAR PRIMARY KEY)
  - `code` (VARCHAR UNIQUE, e.g. `VITTHAL10`)
  - `discount_type` (ENUM: `percentage`, `fixed`)
  - `discount_value` (INT: percentage points or paise)
  - `max_discount_paise`, `min_booking_value_paise` (BIGINT)
  - `start_date`, `expiry_date` (DATE)
  - `max_total_redemptions`, `redemption_count` (INT)
  - `is_active` (BOOLEAN)
- `coupon_redemptions`:
  - `id` (VARCHAR PRIMARY KEY)
  - `coupon_id` (VARCHAR REFERENCES `coupons`)
  - `booking_id` (VARCHAR REFERENCES `bookings`)
  - `discount_applied_paise` (BIGINT)
  - `redeemed_at` (TIMESTAMP)

### 2.10 `post_checkout_campaigns` & `email_notifications`
Automated return customer marketing engine.
- `post_checkout_campaigns`:
  - `id`, `name`, `is_enabled`
  - `discount_type`, `discount_value`
  - `validity_days`, `min_booking_amount_paise`, `max_discount_amount_paise`
  - `email_subject`, `email_body_intro`
- `email_notifications`:
  - `id`, `booking_id`, `booking_reference`
  - `recipient_email`, `customer_name`
  - `coupon_code` (e.g. `RETURN-XXXX`)
  - `delivery_status` (ENUM: `pending`, `sent`, `failed`)
  - `retry_count`, `failure_reason`, `sent_at`

### 2.11 `audit_logs`
Immutable compliance and security ledger.
- `id`, `user_id`, `user_email`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `timestamp`.

