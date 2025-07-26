-- Phase 2 Database Schema for FUZO
-- This migration adds tables for enhanced social features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Food Cards table for swipe feed
CREATE TABLE IF NOT EXISTS food_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    location TEXT NOT NULL,
    coordinates JSONB NOT NULL, -- {lat: number, lng: number}
    rating DECIMAL(2,1),
    price_range TEXT,
    nutritional_info JSONB, -- {calories: number, protein: number, carbs: number, fat: number}
    recipe JSONB, -- {ingredients: string[], instructions: string[], prepTime: number, cookTime: number}
    source JSONB, -- {restaurant: string, chef: string, website: string}
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Swipes table to track swipe actions
CREATE TABLE IF NOT EXISTS user_swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    card_id UUID REFERENCES food_cards(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('left', 'right', 'up', 'down')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location JSONB -- {lat: number, lng: number}
);

-- Video Posts table
CREATE TABLE IF NOT EXISTS video_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    location TEXT,
    coordinates JSONB, -- {lat: number, lng: number}
    tags TEXT[] DEFAULT '{}',
    uploader JSONB NOT NULL, -- {id: string, username: string, avatar: string}
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    duration INTEGER, -- in seconds
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'upload')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
    title TEXT NOT NULL,
    participants TEXT[] NOT NULL,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    message_text TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location', 'restaurant')),
    media_url TEXT,
    location_data JSONB, -- {lat: number, lng: number, name: string}
    restaurant_data JSONB, -- {id: string, name: string, cuisine: string, rating: number}
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friend Visits table for social map
CREATE TABLE IF NOT EXISTS friend_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar TEXT,
    restaurant_id TEXT NOT NULL,
    restaurant_name TEXT NOT NULL,
    coordinates JSONB NOT NULL, -- {lat: number, lng: number}
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    rating DECIMAL(2,1),
    review TEXT,
    emoji_reaction TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    favorite_cuisines TEXT[] DEFAULT '{}',
    dietary_restrictions TEXT[] DEFAULT '{}',
    price_range TEXT CHECK (price_range IN ('low', 'medium', 'high')),
    preferred_distance INTEGER DEFAULT 5000, -- in meters
    notification_settings JSONB DEFAULT '{"new_restaurants": true, "friend_visits": true, "chat_messages": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    bio TEXT,
    location TEXT,
    favorite_cuisines TEXT[] DEFAULT '{}',
    total_swipes INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_saved INTEGER DEFAULT 0,
    member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_cards_cuisine ON food_cards(cuisine);
CREATE INDEX IF NOT EXISTS idx_food_cards_created_at ON food_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_swipes_user_id ON user_swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_card_id ON user_swipes(card_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_direction ON user_swipes(direction);
CREATE INDEX IF NOT EXISTS idx_video_posts_platform ON video_posts(platform);
CREATE INDEX IF NOT EXISTS idx_video_posts_created_at ON video_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_visits_user_id ON friend_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_visits_visit_date ON friend_visits(visit_date DESC);

-- Row Level Security (RLS) policies
ALTER TABLE food_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Sample data for testing
INSERT INTO food_cards (title, description, image, cuisine, location, coordinates, rating, price_range, tags) VALUES
('Margherita Pizza', 'Classic Italian pizza with fresh mozzarella and basil', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop', 'Italian', 'Toronto, ON', '{"lat": 43.6532, "lng": -79.3832}', 4.5, '$$', ARRAY['pizza', 'italian', 'classic']),
('Sushi Roll Combo', 'Fresh salmon and tuna rolls with miso soup', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop', 'Japanese', 'Toronto, ON', '{"lat": 43.6671, "lng": -79.4062}', 4.8, '$$$', ARRAY['sushi', 'japanese', 'fresh']),
('Taco Fiesta', 'Authentic Mexican street tacos with homemade salsa', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop', 'Mexican', 'Toronto, ON', '{"lat": 43.6487, "lng": -79.3774}', 4.3, '$', ARRAY['tacos', 'mexican', 'street food']);

INSERT INTO video_posts (title, description, video_url, location, tags, uploader, platform, likes_count, views_count) VALUES
('How to Make Perfect Pasta', 'Learn the secrets to cooking al dente pasta like a pro', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Toronto, ON', ARRAY['cooking', 'pasta', 'tutorial'], '{"id": "chef1", "username": "ChefMarco", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"}', 'youtube', 156, 1200),
('Sushi Making Masterclass', 'Watch a master sushi chef create beautiful rolls', 'https://www.tiktok.com/@sushimaster/video/123456789', 'Toronto, ON', ARRAY['sushi', 'masterclass', 'japanese'], '{"id": "chef2", "username": "SushiMaster", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}', 'tiktok', 89, 800);

INSERT INTO chats (type, title, participants, last_message, last_message_time, unread_count) VALUES
('direct', 'Foodie Friends', ARRAY['user1', 'user2'], 'Just tried that new Italian place downtown!', NOW() - INTERVAL '2 minutes', 3),
('group', 'Toronto Food Hunters', ARRAY['user1', 'user2', 'user3', 'user4'], 'Anyone up for Korean BBQ this weekend?', NOW() - INTERVAL '15 minutes', 0);

INSERT INTO friend_visits (user_id, username, avatar, restaurant_id, restaurant_name, coordinates, visit_date, rating, review, emoji_reaction) VALUES
('user1', 'Ana', 'https://images.unsplash.com/photo-1494790108755-2616b612c2d5?w=100&h=100&fit=crop&crop=face', 'rest1', 'Bella Vista', '{"lat": 43.6435, "lng": -79.4001}', NOW() - INTERVAL '2 days', 4.5, 'Amazing pasta! The atmosphere was perfect.', '😋'),
('user2', 'Carlos', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', 'rest2', 'Sakura Sushi', '{"lat": 43.6671, "lng": -79.4062}', NOW() - INTERVAL '1 day', 4.8, 'Fresh and delicious!', '🔥');

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = '';

CREATE TRIGGER update_food_cards_updated_at BEFORE UPDATE ON food_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_posts_updated_at BEFORE UPDATE ON video_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 