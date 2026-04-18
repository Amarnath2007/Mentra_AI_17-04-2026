-- ============================================
-- COMMUNITIES SYSTEM - Database Schema
-- Run each block separately if needed
-- ============================================

-- Enable uuid extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Communities table
CREATE TABLE IF NOT EXISTS communities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    topic TEXT DEFAULT 'General',
    icon TEXT DEFAULT '💬',
    created_by UUID,
    member_count INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Community members
CREATE TABLE IF NOT EXISTS community_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, community_id)
);

-- 3. Community messages
CREATE TABLE IF NOT EXISTS community_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL DEFAULT 'User',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
