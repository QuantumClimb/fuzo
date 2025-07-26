-- Add tables for swipe save/hide functionality
-- This migration adds user_saved_items and user_hidden_items tables
-- to support the new swipe gesture features

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Saved Items table - stores items users save by swiping right
CREATE TABLE IF NOT EXISTS user_saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('restaurant', 'food_post', 'video')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Hidden Items table - stores items users hide by swiping left
CREATE TABLE IF NOT EXISTS user_hidden_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('restaurant', 'food_post', 'video')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_saved_items_user_id ON user_saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_items_item_type ON user_saved_items(item_type);
CREATE INDEX IF NOT EXISTS idx_user_saved_items_created_at ON user_saved_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_hidden_items_user_id ON user_hidden_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hidden_items_item_type ON user_hidden_items(item_type);
CREATE INDEX IF NOT EXISTS idx_user_hidden_items_created_at ON user_hidden_items(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_saved_items_user_type ON user_saved_items(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_user_hidden_items_user_type ON user_hidden_items(user_id, item_type);

-- Row Level Security (RLS) policies
ALTER TABLE user_saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hidden_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy for user_saved_items - users can only see their own saved items
CREATE POLICY "Users can view their own saved items" ON user_saved_items
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own saved items" ON user_saved_items
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own saved items" ON user_saved_items
    FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policy for user_hidden_items - users can only see their own hidden items
CREATE POLICY "Users can view their own hidden items" ON user_hidden_items
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own hidden items" ON user_hidden_items
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own hidden items" ON user_hidden_items
    FOR DELETE USING (auth.uid()::text = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_saved_items IS 'Stores items that users have saved by swiping right';
COMMENT ON TABLE user_hidden_items IS 'Stores items that users have hidden by swiping left';
COMMENT ON COLUMN user_saved_items.item_type IS 'Type of item: restaurant, food_post, or video';
COMMENT ON COLUMN user_hidden_items.item_type IS 'Type of item: restaurant, food_post, or video';
