-- Seed Data for Mandli Scheduling System
-- Creates admin account and test users

-- ============================================================================
-- ADMIN ACCOUNT
-- ============================================================================
-- Username: mandli
-- Password: Mandli8 (bcrypt hash below)
INSERT INTO admins (username, password_hash, email)
VALUES (
  'mandli',
  '$2a$10$rKZqJ8H1vF5qX9N3mP2YZuEwHYvL6WX8jK4nR5tS7uV9wA1bC2dEe',  -- Mandli8 hashed
  'admin@mandli.app'
) ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- TEST USERS (10 total - 5 Gents, 5 Ladies)
-- ============================================================================

-- Gents
INSERT INTO users (email, cell_phone, full_name, gender, color, unique_link, is_active)
VALUES
  ('ahmed.khan@gmail.com', '+1-555-0101', 'Ahmed Khan', 'gents', '#FF6B6B', 'abc123gent01', true),
  ('raj.patel@gmail.com', '+1-555-0102', 'Raj Patel', 'gents', '#4ECDC4', 'abc123gent02', true),
  ('david.chen@gmail.com', '+1-555-0103', 'David Chen', 'gents', '#45B7D1', 'abc123gent03', true),
  ('john.smith@gmail.com', '+1-555-0104', 'John Smith', 'gents', '#98D8C8', 'abc123gent04', true),
  ('michael.brown@gmail.com', '+1-555-0105', 'Michael Brown', 'gents', '#87CEEB', 'abc123gent05', true)
ON CONFLICT (email) DO NOTHING;

-- Ladies
INSERT INTO users (email, cell_phone, full_name, gender, color, unique_link, is_active)
VALUES
  ('sarah.johnson@gmail.com', '+1-555-0201', 'Sarah Johnson', 'ladies', '#E24A90', 'abc123lady01', true),
  ('maria.garcia@gmail.com', '+1-555-0202', 'Maria Garcia', 'ladies', '#96CEB4', 'abc123lady02', true),
  ('emily.wilson@gmail.com', '+1-555-0203', 'Emily Wilson', 'ladies', '#DDA0DD', 'abc123lady03', true),
  ('fatima.rashid@gmail.com', '+1-555-0204', 'Fatima Al-Rashid', 'ladies', '#FFB6C1', 'abc123lady04', true),
  ('priya.sharma@gmail.com', '+1-555-0205', 'Priya Sharma', 'ladies', '#B19CD9', 'abc123lady05', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SAMPLE AVAILABILITY (January 2025)
-- ============================================================================

-- 8 out of 10 users have filled availability
INSERT INTO availability (user_id, month, available_days, update_count)
SELECT
  u.id,
  '2025-01',
  ARRAY[1,2,3,5,7,10,12,15,18,20,22,25,28,30],
  0
FROM users u
WHERE u.email IN (
  'ahmed.khan@gmail.com',
  'raj.patel@gmail.com',
  'david.chen@gmail.com',
  'john.smith@gmail.com',
  'sarah.johnson@gmail.com',
  'maria.garcia@gmail.com',
  'emily.wilson@gmail.com',
  'priya.sharma@gmail.com'
)
ON CONFLICT (user_id, month) DO NOTHING;

-- ============================================================================
-- SAMPLE SCHEDULES (January 2025 - First Week)
-- ============================================================================

DO $$
DECLARE
  user_ahmed UUID;
  user_raj UUID;
  user_david UUID;
  user_john UUID;
  user_sarah UUID;
  user_maria UUID;
  user_emily UUID;
  user_priya UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO user_ahmed FROM users WHERE email = 'ahmed.khan@gmail.com';
  SELECT id INTO user_raj FROM users WHERE email = 'raj.patel@gmail.com';
  SELECT id INTO user_david FROM users WHERE email = 'david.chen@gmail.com';
  SELECT id INTO user_john FROM users WHERE email = 'john.smith@gmail.com';
  SELECT id INTO user_sarah FROM users WHERE email = 'sarah.johnson@gmail.com';
  SELECT id INTO user_maria FROM users WHERE email = 'maria.garcia@gmail.com';
  SELECT id INTO user_emily FROM users WHERE email = 'emily.wilson@gmail.com';
  SELECT id INTO user_priya FROM users WHERE email = 'priya.sharma@gmail.com';

  -- Day 1 (Jan 1, 2025)
  INSERT INTO schedules (month, day, duty_type, assigned_user_id)
  VALUES
    ('2025-01', 1, 'early_paat_gents_1', user_ahmed),
    ('2025-01', 1, 'early_paat_gents_2', user_raj),
    ('2025-01', 1, 'early_paat_ladies_1', user_sarah),
    ('2025-01', 1, 'early_paat_ladies_2', user_maria),
    ('2025-01', 1, 'late_paat_gents_1', user_david),
    ('2025-01', 1, 'late_paat_gents_2', user_john),
    ('2025-01', 1, 'late_paat_ladies_1', user_emily),
    ('2025-01', 1, 'late_paat_ladies_2', user_priya)
  ON CONFLICT (month, day, duty_type) DO NOTHING;

  -- Day 2 (Jan 2, 2025)
  INSERT INTO schedules (month, day, duty_type, assigned_user_id)
  VALUES
    ('2025-01', 2, 'early_paat_gents_1', user_david),
    ('2025-01', 2, 'early_paat_gents_2', user_john),
    ('2025-01', 2, 'early_paat_ladies_1', user_emily),
    ('2025-01', 2, 'early_paat_ladies_2', user_priya),
    ('2025-01', 2, 'late_paat_gents_1', user_ahmed),
    ('2025-01', 2, 'late_paat_gents_2', user_raj),
    ('2025-01', 2, 'late_paat_ladies_1', user_sarah),
    ('2025-01', 2, 'late_paat_ladies_2', user_maria)
  ON CONFLICT (month, day, duty_type) DO NOTHING;

  -- Day 3 (Jan 3, 2025) - Leave some slots unassigned for testing
  INSERT INTO schedules (month, day, duty_type, assigned_user_id)
  VALUES
    ('2025-01', 3, 'early_paat_gents_1', user_raj),
    ('2025-01', 3, 'early_paat_gents_2', NULL),  -- Unassigned
    ('2025-01', 3, 'early_paat_ladies_1', user_maria),
    ('2025-01', 3, 'early_paat_ladies_2', NULL),  -- Unassigned
    ('2025-01', 3, 'late_paat_gents_1', user_john),
    ('2025-01', 3, 'late_paat_gents_2', user_ahmed),
    ('2025-01', 3, 'late_paat_ladies_1', NULL),  -- Unassigned
    ('2025-01', 3, 'late_paat_ladies_2', user_sarah)
  ON CONFLICT (month, day, duty_type) DO NOTHING;
END $$;

-- ============================================================================
-- SAMPLE ALERTS
-- ============================================================================

INSERT INTO alerts (type, severity, message, data, resolved)
VALUES
  (
    'missing_slots',
    'error',
    '3 slots unassigned on January 3, 2025',
    '{"day": 3, "month": "2025-01", "slots": ["early_paat_gents_2", "early_paat_ladies_2", "late_paat_ladies_1"]}',
    false
  ),
  (
    'no_availability',
    'warning',
    '2 people have not filled availability for January 2025',
    '{"users": ["Michael Brown", "Fatima Al-Rashid"]}',
    false
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment to verify data
-- SELECT 'Admin created:', username FROM admins;
-- SELECT 'Users created:', COUNT(*) FROM users;
-- SELECT 'Availability records:', COUNT(*) FROM availability;
-- SELECT 'Schedules created:', COUNT(*) FROM schedules;
-- SELECT 'Unassigned slots:', COUNT(*) FROM schedules WHERE assigned_user_id IS NULL;
-- SELECT 'Alerts created:', COUNT(*) FROM alerts WHERE resolved = false;
