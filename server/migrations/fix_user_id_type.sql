-- ============================================
-- FIX: Change user_id from UUID to TEXT
-- This allows demo accounts with non-UUID IDs to work
-- ============================================

-- 1. Alter journeys table
ALTER TABLE journeys ALTER COLUMN user_id TYPE TEXT;

-- 2. Alter rewards table
-- (If you already created it with UUID)
ALTER TABLE rewards ALTER COLUMN user_id TYPE TEXT;

-- 3. Update journey_tasks if needed (usually it references journey_id not user_id, which is fine)
-- If there are any other tables using user_id as UUID, they should be changed here too.
