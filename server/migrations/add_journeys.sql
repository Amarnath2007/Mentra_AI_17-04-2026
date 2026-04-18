-- ============================================
-- MY JOURNEY - Database Schema
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Journeys table
CREATE TABLE IF NOT EXISTS journeys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    goal TEXT NOT NULL,
    experience_level TEXT DEFAULT 'beginner',
    duration_days INT DEFAULT 7,
    status TEXT DEFAULT 'active',  -- 'active' or 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Journey tasks table
CREATE TABLE IF NOT EXISTS journey_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    day_number INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journeys_user ON journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_tasks_journey ON journey_tasks(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_tasks_day ON journey_tasks(journey_id, day_number);
