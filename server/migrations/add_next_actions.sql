-- Create next_actions table
CREATE TABLE IF NOT EXISTS next_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    reason TEXT,
    estimated_time TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'skipped'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_next_actions_user_date ON next_actions(user_id, created_at DESC);
