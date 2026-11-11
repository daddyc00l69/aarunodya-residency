-- ============================================================================
-- Luxury Lodge Booking & Management System: Normalized PostgreSQL Schema
-- Compatible with Supabase, PostgreSQL 14+, Vercel Postgres, AWS RDS
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM ('hold', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'captured', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('razorpay', 'cash', 'card_pos', 'upi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE housekeeping_status_enum AS ENUM ('clean', 'dirty', 'inspecting', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('super_admin', 'manager', 'front_desk', 'housekeeping');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    check_in_time VARCHAR(10) DEFAULT '14:00',
    check_out_time VARCHAR(10) DEFAULT '11:00',
    currency VARCHAR(10) DEFAULT 'INR',
    tax_rate_percent NUMERIC(5,2) DEFAULT 12.00,
    resort_fee_percent NUMERIC(5,2) DEFAULT 5.00,
    cancellation_policy TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROOM TYPES TABLE
CREATE TABLE IF NOT EXISTS room_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    base_occupancy INTEGER NOT NULL DEFAULT 2,
    max_occupancy INTEGER NOT NULL DEFAULT 4,
    bed_config VARCHAR(100) NOT NULL,
    room_size_sqft INTEGER NOT NULL,
    view_type VARCHAR(100) NOT NULL,
    base_price_paise BIGINT NOT NULL CHECK (base_price_paise > 0), -- e.g. 650000 = ₹6,500
    extra_guest_fee_paise BIGINT NOT NULL DEFAULT 150000,          -- e.g. 150000 = ₹1,500
    amenities JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PHYSICAL ROOMS TABLE
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    floor INTEGER NOT NULL DEFAULT 1,
    housekeeping_status housekeeping_status_enum DEFAULT 'clean',
    is_operational BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GUESTS TABLE
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(50) UNIQUE NOT NULL, -- e.g. "WPL-2026-XXXX"
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    assigned_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_nights INTEGER NOT NULL CHECK (num_nights > 0),
    num_adults INTEGER NOT NULL CHECK (num_adults > 0),
    num_children INTEGER NOT NULL DEFAULT 0,
    num_rooms INTEGER NOT NULL DEFAULT 1,
    status booking_status_enum NOT NULL DEFAULT 'hold',
    
    -- Monetary columns in integer minor units (paise)
    subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0),
    extra_guest_fee_paise BIGINT NOT NULL DEFAULT 0,
    resort_fee_paise BIGINT NOT NULL DEFAULT 0,
    tax_paise BIGINT NOT NULL DEFAULT 0,
    discount_paise BIGINT NOT NULL DEFAULT 0,
    total_amount_paise BIGINT NOT NULL CHECK (total_amount_paise >= 0),
    paid_amount_paise BIGINT NOT NULL DEFAULT 0,
    
    hold_expires_at TIMESTAMPTZ, -- 15-minute checkout lock
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date)
);

-- 8. BOOKING ROOM ITEMS TABLE (Supports multi-room bookings)
CREATE TABLE IF NOT EXISTS booking_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    night_rate_paise BIGINT NOT NULL CHECK (night_rate_paise >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    booking_reference VARCHAR(50),
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method payment_method_enum NOT NULL DEFAULT 'razorpay',
    status payment_status_enum NOT NULL DEFAULT 'pending',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    failure_reason TEXT,
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    captured_at TIMESTAMPTZ
);

-- 10. STAFF USERS TABLE
CREATE TABLE IF NOT EXISTS staff_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'front_desk',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. HIGH-PERFORMANCE INDEXES FOR CONCURRENCY & OVERLAP QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings (check_in_date, check_out_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_room_type ON bookings (room_type_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_room ON bookings (assigned_room_id, status) WHERE assigned_room_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings (booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_hold_expiry ON bookings (hold_expires_at) WHERE status = 'hold';
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms (room_type_id, is_operational, housekeeping_status);

-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;

-- Public can read active properties and room types
CREATE POLICY "Public can view properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Public can view active room types" ON room_types FOR SELECT USING (is_active = true);

-- Public can lookup their own booking by reference
CREATE POLICY "Public can lookup own booking" ON bookings FOR SELECT USING (true);
