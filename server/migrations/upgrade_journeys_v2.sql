-- ============================================
-- MY JOURNEY V2 - Schema Upgrade
-- Run this AFTER the original add_journeys.sql
-- ============================================

-- Add new columns to journey_tasks
ALTER TABLE journey_tasks ADD COLUMN IF NOT EXISTS topic TEXT DEFAULT '';
ALTER TABLE journey_tasks ADD COLUMN IF NOT EXISTS resource_link TEXT DEFAULT '';
ALTER TABLE journey_tasks ADD COLUMN IF NOT EXISTS quiz JSONB DEFAULT '[]'::jsonb;
ALTER TABLE journey_tasks ADD COLUMN IF NOT EXISTS score FLOAT DEFAULT 0;
ALTER TABLE journey_tasks ADD COLUMN IF NOT EXISTS is_unlocked BOOLEAN DEFAULT FALSE;

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    reward_text TEXT NOT NULL,
    milestone_days INT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rewards_user ON rewards(user_id);
