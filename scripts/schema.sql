-- Aarunodya Residency Bhakt Niwas - PostgreSQL Database Schema
-- Compatible with Supabase, Neon, AWS RDS, and Vercel Postgres

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

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  guest_id TEXT REFERENCES guests(id),
  room_type_id TEXT REFERENCES room_types(id),
  assigned_room_id TEXT REFERENCES rooms(id),
  assigned_room_number TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  num_nights INTEGER NOT NULL,
  num_adults INTEGER NOT NULL,
  num_children INTEGER DEFAULT 0,
  num_rooms INTEGER DEFAULT 1,
  status TEXT NOT NULL,
  subtotal_paise INTEGER NOT NULL,
  extra_guest_fee_paise INTEGER DEFAULT 0,
  resort_fee_paise INTEGER DEFAULT 0,
  tax_paise INTEGER NOT NULL,
  discount_paise INTEGER DEFAULT 0,
  total_amount_paise INTEGER NOT NULL,
  paid_amount_paise INTEGER DEFAULT 0,
  hold_expires_at TIMESTAMPTZ,
  special_requests TEXT,
  cancellation_reason TEXT,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT REFERENCES bookings(id),
  booking_reference TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  transaction_reference TEXT UNIQUE NOT NULL,
  gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  captured_at TIMESTAMPTZ
);
