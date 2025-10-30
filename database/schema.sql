-- Mandli Scheduling System - Complete Database Schema
-- Project ID: wfywbiryulnopmkwtixg
-- Generated: 2025-10-29

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ADMIN TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USERS TABLE (Team Members)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  cell_phone TEXT,
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('gents', 'ladies')) NOT NULL,
  color TEXT DEFAULT '#FF6B6B',
  unique_link TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deactivated_at TIMESTAMP WITH TIME ZONE,
  last_reminded_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_unique_link ON users(unique_link);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);

-- ============================================================================
-- GMAIL SENDER (OAuth Configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gmail_sender (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  authenticated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AVAILABILITY (Monthly Submissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  available_days INTEGER[] NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  update_count INTEGER DEFAULT 0,
  UNIQUE(user_id, month)
);

-- Indexes for availability
CREATE INDEX IF NOT EXISTS idx_availability_user ON availability(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_month ON availability(month);

-- ============================================================================
-- SCHEDULES (8 Slots Per Day)
-- ============================================================================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,
  day INTEGER CHECK (day >= 1 AND day <= 31) NOT NULL,
  duty_type TEXT CHECK (duty_type IN (
    'early_paat_gents_1',
    'early_paat_gents_2',
    'early_paat_ladies_1',
    'early_paat_ladies_2',
    'late_paat_gents_1',
    'late_paat_gents_2',
    'late_paat_ladies_1',
    'late_paat_ladies_2'
  )) NOT NULL,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, day, duty_type)
);

-- Indexes for schedules
CREATE INDEX IF NOT EXISTS idx_schedules_month ON schedules(month);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day);
CREATE INDEX IF NOT EXISTS idx_schedules_user ON schedules(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_month_day ON schedules(month, day);

-- ============================================================================
-- CALENDAR INVITES (Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invites_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  day INTEGER NOT NULL,
  duty_type TEXT NOT NULL,
  google_event_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('sent', 'failed')) DEFAULT 'sent'
);

-- Indexes for invites
CREATE INDEX IF NOT EXISTS idx_invites_user ON invites_sent(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_month ON invites_sent(month);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites_sent(status);

-- ============================================================================
-- ALERTS (Dashboard Warnings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN (
    'invalid_email',
    'missing_slots',
    'no_availability',
    'invite_failure',
    'token_expiring'
  )) NOT NULL,
  severity TEXT CHECK (severity IN ('error', 'warning', 'info')) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically for availability
CREATE OR REPLACE FUNCTION update_availability_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.update_count = OLD.update_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER availability_update_trigger
  BEFORE UPDATE ON availability
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_timestamp();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Schedule with user details
CREATE OR REPLACE VIEW schedule_details AS
SELECT
  s.id,
  s.month,
  s.day,
  s.duty_type,
  s.assigned_user_id,
  u.full_name,
  u.email,
  u.cell_phone,
  u.gender,
  u.color,
  s.assigned_at
FROM schedules s
LEFT JOIN users u ON s.assigned_user_id = u.id;

-- View: User availability status
CREATE OR REPLACE VIEW user_availability_status AS
SELECT
  u.id,
  u.full_name,
  u.email,
  u.cell_phone,
  u.gender,
  u.is_active,
  a.month,
  CASE
    WHEN a.id IS NOT NULL THEN true
    ELSE false
  END as has_availability,
  a.submitted_at,
  a.updated_at,
  a.update_count,
  u.last_reminded_at
FROM users u
LEFT JOIN availability a ON u.id = a.user_id AND a.month = to_char(CURRENT_DATE, 'YYYY-MM');

-- View: Monthly coverage summary
CREATE OR REPLACE VIEW monthly_coverage AS
SELECT
  month,
  COUNT(*) as total_slots,
  COUNT(assigned_user_id) as assigned_slots,
  COUNT(*) - COUNT(assigned_user_id) as missing_slots,
  ROUND(COUNT(assigned_user_id)::NUMERIC / COUNT(*)::NUMERIC * 100, 1) as coverage_percentage
FROM schedules
GROUP BY month;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_sender ENABLE ROW LEVEL SECURITY;

-- Admin policies (service role has full access)
-- Users policies (public read for availability form via unique link)
-- All other operations require authentication

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE admins IS 'Admin accounts with username/password authentication';
COMMENT ON TABLE users IS 'Team members (Mandlis) with gender and unique links';
COMMENT ON TABLE availability IS 'Monthly availability submissions - users select days they are available';
COMMENT ON TABLE schedules IS '8 slots per day (2 Early Gents, 2 Early Ladies, 2 Late Gents, 2 Late Ladies)';
COMMENT ON TABLE invites_sent IS 'Tracking for calendar invites sent via Gmail';
COMMENT ON TABLE alerts IS 'Dashboard alerts for missing slots, invalid emails, etc.';
COMMENT ON TABLE gmail_sender IS 'Gmail OAuth tokens for sending calendar invites';

COMMENT ON COLUMN users.gender IS 'Either "gents" or "ladies" - determines which paat slots they can be assigned';
COMMENT ON COLUMN availability.available_days IS 'Array of days (1-31) when user is available - system decides early vs late';
COMMENT ON COLUMN schedules.duty_type IS 'One of 8 slot types per day';
