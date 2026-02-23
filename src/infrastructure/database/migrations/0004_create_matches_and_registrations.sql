-- Migration: 0004_create_matches_and_registrations
-- Description: Add merit config to groups and create matches/registrations tables

-- Add merit configuration to groups
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS merit_config_max_matches INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS merit_points_played INTEGER NOT NULL DEFAULT 3,
ADD COLUMN IF NOT EXISTS merit_points_no_show INTEGER NOT NULL DEFAULT -5,
ADD COLUMN IF NOT EXISTS merit_points_reserve INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS merit_points_positive_attitude INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS merit_points_negative_attitude INTEGER NOT NULL DEFAULT -1,
ADD COLUMN IF NOT EXISTS merit_config_hours_before_penalty INTEGER NOT NULL DEFAULT 12,
ADD COLUMN IF NOT EXISTS merit_points_late_cancel INTEGER NOT NULL DEFAULT -2;

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    sport VARCHAR(50) NOT NULL CHECK (sport IN ('football', 'basketball', 'padel')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    location TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'playing', 'finished', 'cancelled')),
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    team_a_color VARCHAR(7) NOT NULL DEFAULT '#000000',
    team_b_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Match Registrations (Participants)
CREATE TABLE IF NOT EXISTS match_registrations (
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_reserve BOOLEAN NOT NULL DEFAULT FALSE,
    did_play BOOLEAN, -- NULL means not evaluated yet
    attitude VARCHAR(20) NOT NULL DEFAULT 'neutral' CHECK (attitude IN ('positive', 'negative', 'neutral')),
    is_late_cancellation BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (match_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_group_id ON matches(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_registrations_user_id ON match_registrations(user_id);
