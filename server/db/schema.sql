CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  role VARCHAR(20) NOT NULL CHECK (role IN ('pengguna', 'penyedia')),
  picture_url TEXT,
  google_sub VARCHAR(255) UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ============================================================
-- Migration: 002_add_provider_and_booking_modules.sql
-- HANYA MENAMBAH — tidak mengubah tabel users yang sudah ada
-- ============================================================

-- Tambah role 'admin' ke constraint yang sudah ada.
-- Drop dulu constraint lama, lalu buat ulang dengan 3 pilihan role.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('pengguna', 'penyedia', 'admin'));

-- ── Provider profiles ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  ktp_url TEXT,
  selfie_url TEXT,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  hourly_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  service_radius_km INT NOT NULL DEFAULT 5,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  area_description VARCHAR(255),
  avg_rating REAL NOT NULL DEFAULT 0,
  total_reviews INT NOT NULL DEFAULT 0,
  total_bookings INT NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_status ON provider_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_provider_latlng ON provider_profiles(latitude, longitude);

-- ── Kategori jasa per provider ──────────────────────────────
CREATE TABLE IF NOT EXISTS provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL CHECK (category IN ('temenin', 'curhat', 'bantu_aktivitas')),
  UNIQUE (provider_id, category)
);

-- ── Jadwal ketersediaan provider ────────────────────────────
CREATE TABLE IF NOT EXISTS provider_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Minggu
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (provider_id, day_of_week)
);

-- ── Bookings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id),
  service_category VARCHAR(30) NOT NULL CHECK (service_category IN ('temenin', 'curhat', 'bantu_aktivitas')),
  session_date DATE NOT NULL,
  session_start TIME NOT NULL,
  duration_hours INT NOT NULL CHECK (duration_hours >= 1),
  total_price NUMERIC(12,2) NOT NULL,
  platform_fee NUMERIC(12,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'waiting_confirmation'
    CHECK (status IN ('waiting_confirmation', 'confirmed', 'in_progress', 'completed', 'cancelled', 'auto_cancelled')),
  notes TEXT,
  confirm_deadline TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ── Payments & Escrow ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  midtrans_order_id VARCHAR(100) NOT NULL UNIQUE,
  midtrans_transaction_id VARCHAR(100) UNIQUE,
  payment_method VARCHAR(50),
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
  paid_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  payment_id UUID NOT NULL REFERENCES payments(id),
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'held'
    CHECK (status IN ('held', 'released', 'refunded_full', 'refunded_partial')),
  release_trigger VARCHAR(20) CHECK (release_trigger IN ('user_confirm', 'auto_24h')),
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Wallet provider ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS provider_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL UNIQUE REFERENCES provider_profiles(id),
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES provider_wallets(id),
  booking_id UUID REFERENCES bookings(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'commission')),
  amount NUMERIC(12,2) NOT NULL,
  commission_amount NUMERIC(12,2) DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES provider_wallets(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Trigger: auto-create wallet saat provider_profile dibuat ─
CREATE OR REPLACE FUNCTION create_provider_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO provider_wallets (provider_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_provider_wallet ON provider_profiles;
CREATE TRIGGER trg_create_provider_wallet
  AFTER INSERT ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION create_provider_wallet();

-- ============================================================
-- Migration: 003_add_reviews_and_chat.sql
-- HANYA MENAMBAH — gabungkan ke akhir schema.sql, sama seperti
-- migration 002 sebelumnya
-- ============================================================
 
-- ── Reviews ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL CHECK (LENGTH(comment) >= 10),
  provider_reply TEXT,
  replied_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);
 
-- ── Chat sessions & messages ─────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message_type VARCHAR(20) NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'location', 'image')),
  content TEXT,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE INDEX IF NOT EXISTS idx_chat_msg_session ON chat_messages(session_id);
 
-- ── Trigger: auto-create chat_session saat booking dikonfirmasi
CREATE OR REPLACE FUNCTION create_chat_session_on_confirm()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'waiting_confirmation' THEN
    INSERT INTO chat_sessions (booking_id, expires_at)
    VALUES (
      NEW.id,
      (NEW.session_date + NEW.session_start + (NEW.duration_hours || ' hours')::INTERVAL + INTERVAL '30 days')
    )
    ON CONFLICT (booking_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
DROP TRIGGER IF EXISTS trg_create_chat_session ON bookings;
CREATE TRIGGER trg_create_chat_session
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION create_chat_session_on_confirm();
 
-- ── Trigger: auto-update avg_rating provider saat ada review baru
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE provider_profiles
  SET
    avg_rating = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = NEW.reviewee_id AND is_deleted = false),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id AND is_deleted = false),
    updated_at = NOW()
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
DROP TRIGGER IF EXISTS trg_update_provider_rating ON reviews;
CREATE TRIGGER trg_update_provider_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- ============================================================
-- Migration: 004_add_email_otp_codes.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS email_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_otp_user ON email_otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_otp_expires ON email_otp_codes(expires_at);
 