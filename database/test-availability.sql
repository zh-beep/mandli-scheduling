-- Add availability data for 5 people for November 2025 to test matching algorithm
-- These people will have high availability (20+ days each)

-- User IDs from existing seed data (actual UUIDs from database):
-- Ahmed Khan: 22ea57f2-b16f-4f2b-a3ac-0094e5b36785
-- Sarah Johnson: 610e0fd0-dd0d-4b1b-ae16-757954b78fd6
-- Raj Patel: 63e353ae-bef3-4cac-9ccf-d10393281641
-- Maria Garcia: 565ddda4-1dc5-46a4-8ac3-a12f21b6c741
-- Emily Wilson: 06d1835a-3923-4a09-9fe5-867870b12135

-- Ahmed Khan - Available most of November (25 days)
INSERT INTO availability (user_id, month, available_days) VALUES
('22ea57f2-b16f-4f2b-a3ac-0094e5b36785', '2025-11',
 ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,18,19,20,21,22,25,26,27,28,29])
ON CONFLICT (user_id, month)
DO UPDATE SET available_days = EXCLUDED.available_days;

-- Sarah Johnson - Available most of November (23 days)
INSERT INTO availability (user_id, month, available_days) VALUES
('610e0fd0-dd0d-4b1b-ae16-757954b78fd6', '2025-11',
 ARRAY[1,2,3,4,5,8,9,10,11,12,13,14,15,16,17,18,21,22,23,24,25,28,29])
ON CONFLICT (user_id, month)
DO UPDATE SET available_days = EXCLUDED.available_days;

-- Raj Patel - Available most of November (22 days)
INSERT INTO availability (user_id, month, available_days) VALUES
('63e353ae-bef3-4cac-9ccf-d10393281641', '2025-11',
 ARRAY[2,3,4,5,6,7,8,9,10,11,14,15,16,17,18,19,20,21,22,25,26,27])
ON CONFLICT (user_id, month)
DO UPDATE SET available_days = EXCLUDED.available_days;

-- Maria Garcia - Available most of November (24 days)
INSERT INTO availability (user_id, month, available_days) VALUES
('565ddda4-1dc5-46a4-8ac3-a12f21b6c741', '2025-11',
 ARRAY[1,2,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,23,24,25,26,27,28])
ON CONFLICT (user_id, month)
DO UPDATE SET available_days = EXCLUDED.available_days;

-- Emily Wilson - Available most of November (21 days)
INSERT INTO availability (user_id, month, available_days) VALUES
('06d1835a-3923-4a09-9fe5-867870b12135', '2025-11',
 ARRAY[1,4,5,6,7,8,9,10,11,12,15,16,17,18,19,22,23,24,25,26,29])
ON CONFLICT (user_id, month)
DO UPDATE SET available_days = EXCLUDED.available_days;

-- Verify the data
SELECT
  u.full_name,
  u.gender,
  a.month,
  array_length(a.available_days, 1) as days_available
FROM availability a
JOIN users u ON a.user_id = u.id
WHERE a.month = '2025-11'
ORDER BY u.full_name;
