-- Aarunodya Residency Bhakt Niwas - Comprehensive PostgreSQL Database Schema
-- Production Ready: Compatible with Supabase, Neon, AWS RDS, and Vercel Postgres

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT NOT NULL,
  whatsapp_number TEXT,
  check_in_time TEXT NOT NULL,
  check_out_time TEXT NOT NULL,
  temple_distance_text TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price_paise INTEGER NOT NULL,
  base_occupancy INTEGER NOT NULL,
  max_occupancy INTEGER NOT NULL,
  extra_guest_fee_paise INTEGER DEFAULT 0,
  is_ac BOOLEAN DEFAULT TRUE,
  has_hot_water BOOLEAN DEFAULT TRUE,
  has_wifi BOOLEAN DEFAULT TRUE,
  bed_type TEXT NOT NULL,
  view_type TEXT NOT NULL,
  total_inventory INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  room_number TEXT UNIQUE NOT NULL,
  room_type_id TEXT REFERENCES room_types(id),
  floor INTEGER NOT NULL,
  is_operational BOOLEAN DEFAULT TRUE,
  housekeeping_status TEXT DEFAULT 'clean',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT UNIQUE NOT NULL,
  alt_phone TEXT,
  email TEXT UNIQUE NOT NULL,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  total_visits INTEGER DEFAULT 0,
  total_spent_paise BIGINT DEFAULT 0,
  notes TEXT,
  is_merged BOOLEAN DEFAULT FALSE,
  merged_into_customer_id TEXT REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_identity_documents (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number_masked TEXT NOT NULL,
  document_number_encrypted TEXT,
  issuing_country TEXT DEFAULT 'India',
  expiry_date DATE,
  file_path TEXT,
  file_mime_type TEXT,
  file_size_bytes BIGINT,
  original_file_name TEXT,
  verification_status TEXT DEFAULT 'pending',
  verified_by_staff_id TEXT,
  verified_by_staff_name TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_proof_type TEXT,
  id_proof_number TEXT,
  city TEXT,
  state TEXT,
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  discount_type TEXT NOT NULL, -- 'fixed' or 'percentage'
  discount_value INTEGER NOT NULL, -- paise or percent
  max_discount_paise INTEGER,
  min_booking_value_paise INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  max_total_redemptions INTEGER DEFAULT 100,
  current_redemptions_count INTEGER DEFAULT 0,
  max_redemptions_per_customer INTEGER DEFAULT 1,
  eligible_room_type_ids TEXT[] DEFAULT '{}',
  customer_eligibility TEXT DEFAULT 'all', -- 'all', 'first_time', 'returning'
  specific_customer_ids TEXT[] DEFAULT '{}',
  min_stay_nights INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  admin_notes TEXT,
  campaign_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  guest_id TEXT REFERENCES guests(id),
  customer_id TEXT REFERENCES customers(id),
  room_type_id TEXT REFERENCES room_types(id),
  assigned_room_id TEXT REFERENCES rooms(id),
  assigned_room_number TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  num_nights INTEGER NOT NULL,
  num_adults INTEGER NOT NULL,
  num_children INTEGER DEFAULT 0,
  num_rooms INTEGER DEFAULT 1,
  status TEXT NOT NULL, -- 'hold', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'expired'
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'partially_paid', 'paid', 'partially_refunded', 'refunded'
  subtotal_paise INTEGER NOT NULL,
  extra_guest_fee_paise INTEGER DEFAULT 0,
  resort_fee_paise INTEGER DEFAULT 0,
  tax_paise INTEGER NOT NULL,
  discount_paise INTEGER DEFAULT 0,
  total_amount_paise INTEGER NOT NULL,
  paid_amount_paise INTEGER DEFAULT 0,
  remaining_balance_paise INTEGER DEFAULT 0,
  coupon_code TEXT REFERENCES coupons(code),
  coupon_discount_paise INTEGER DEFAULT 0,
  hold_expires_at TIMESTAMPTZ,
  special_requests TEXT,
  cancellation_reason TEXT,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  created_by_staff_id TEXT,
  created_by_staff_name TEXT,
  checked_in_by_staff_name TEXT,
  checked_out_by_staff_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_guests (
  id TEXT PRIMARY KEY,
  booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  id_proof_type TEXT,
  id_proof_number_masked TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT REFERENCES bookings(id),
  booking_reference TEXT NOT NULL,
  receipt_number TEXT,
  amount_paise INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT NOT NULL, -- 'razorpay', 'cash', 'card_pos', 'upi'
  status TEXT NOT NULL, -- 'captured', 'refunded', 'pending', 'failed'
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  transaction_reference TEXT UNIQUE NOT NULL,
  cashier_id TEXT,
  cashier_name TEXT,
  notes TEXT,
  gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  captured_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cash_transactions (
  id TEXT PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  booking_id TEXT REFERENCES bookings(id),
  booking_reference TEXT,
  transaction_type TEXT NOT NULL, -- 'payment', 'refund', 'deposit', 'withdrawal'
  amount_paise INTEGER NOT NULL,
  cashier_id TEXT NOT NULL,
  cashier_name TEXT NOT NULL,
  notes TEXT,
  authorized_by_manager_id TEXT,
  authorized_by_manager_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_shift_reconciliations (
  id TEXT PRIMARY KEY,
  shift_date DATE NOT NULL,
  opened_by_staff_id TEXT NOT NULL,
  opened_by_staff_name TEXT NOT NULL,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  opening_float_paise INTEGER DEFAULT 0,
  closed_by_staff_id TEXT,
  closed_by_staff_name TEXT,
  closed_at TIMESTAMPTZ,
  expected_closing_cash_paise INTEGER,
  actual_closing_cash_paise INTEGER,
  discrepancy_paise INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'open' -- 'open', 'closed'
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id TEXT PRIMARY KEY,
  coupon_id TEXT REFERENCES coupons(id),
  coupon_code TEXT NOT NULL,
  booking_id TEXT REFERENCES bookings(id),
  booking_reference TEXT NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  discount_applied_paise INTEGER NOT NULL,
  booking_total_before_discount_paise INTEGER NOT NULL,
  status TEXT DEFAULT 'consumed', -- 'reserved', 'consumed', 'released'
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  consumed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS post_checkout_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  discount_type TEXT NOT NULL,
  discount_value INTEGER NOT NULL,
  max_discount_paise INTEGER,
  min_booking_value_paise INTEGER DEFAULT 0,
  validity_days INTEGER DEFAULT 90,
  email_subject TEXT NOT NULL,
  promotional_message TEXT NOT NULL,
  generate_unique_code_per_customer BOOLEAN DEFAULT TRUE,
  allow_repeated_issuance_after_future_stays BOOLEAN DEFAULT TRUE,
  cooldown_days_between_issuance INTEGER DEFAULT 14,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_notifications (
  id TEXT PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  booking_reference TEXT NOT NULL,
  campaign_id TEXT REFERENCES post_checkout_campaigns(id),
  coupon_code TEXT,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_import_jobs (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  imported_by_staff_id TEXT NOT NULL,
  imported_by_staff_name TEXT NOT NULL,
  duplicate_strategy TEXT NOT NULL, -- 'skip', 'update', 'fail'
  total_rows INTEGER NOT NULL,
  successful_rows INTEGER NOT NULL,
  skipped_rows INTEGER NOT NULL,
  failed_rows INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_cash_tx_date ON cash_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_code ON coupon_redemptions(coupon_code);
CREATE INDEX IF NOT EXISTS idx_email_notifications_ref ON email_notifications(booking_reference);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
