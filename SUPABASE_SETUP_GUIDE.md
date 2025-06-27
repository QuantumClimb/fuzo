# 🚀 FUZO Supabase Multi-Tenant Setup Guide

## Overview
This guide will help you set up Supabase for FUZO's multi-tenant food discovery SaaS platform with a 50-user beta program.

## 📋 Prerequisites
- Supabase account (free tier is sufficient for beta)
- Node.js 18+ installed
- Your Google Maps API key ready

## 🎯 Step 1: Create Supabase Project

### 1.1 Create New Project
```bash
# Go to https://supabase.com/dashboard
# Click "New Project"
# Fill in details:
# - Name: FUZO Production (or FUZO Beta)
# - Database Password: Generate a strong password
# - Region: Asia South (Mumbai) - for India users
```

### 1.2 Get Your Credentials
```bash
# From Project Settings > API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 🏗️ Step 2: Database Schema Setup

### 2.1 Enable Required Extensions
```sql
-- Go to Database > Extensions and enable:
-- 1. uuid-ossp (UUID generation)
-- 2. postgis (Geographic data - if using location features)

-- Run in SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### 2.2 Create Core Tables
```sql
-- Run this in Supabase SQL Editor:

-- Enable Row Level Security globally
ALTER DATABASE postgres SET row_security = on;

-- 1. Tenants/Organizations Table
CREATE TABLE public.tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  plan TEXT DEFAULT 'beta' CHECK (plan IN ('beta', 'starter', 'pro', 'enterprise')),
  max_users INTEGER DEFAULT 50,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 2. User Profiles Table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  
  -- Food Preferences
  dietary_preferences JSONB DEFAULT '[]', -- ["vegetarian", "gluten_free", etc.]
  cuisine_preferences JSONB DEFAULT '[]', -- ["indian", "italian", etc.]
  spice_tolerance TEXT DEFAULT 'medium' CHECK (spice_tolerance IN ('low', 'medium', 'high')),
  budget_range JSONB DEFAULT '{"min": 0, "max": 1000}',
  
  -- Location & Privacy
  location_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{"location_sharing": false, "activity_sharing": false}',
  
  -- Beta & Status
  is_beta_user BOOLEAN DEFAULT false,
  beta_feedback_provided BOOLEAN DEFAULT false,
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Saved Restaurants
CREATE TABLE public.saved_restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Google Places Data
  place_id TEXT NOT NULL, -- Google Place ID
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  google_rating DECIMAL(2,1),
  price_level INTEGER,
  photos JSONB DEFAULT '[]',
  types JSONB DEFAULT '[]', -- ["restaurant", "food", etc.]
  
  -- User Data
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_notes TEXT,
  tags JSONB DEFAULT '[]', -- ["date_night", "family_friendly", etc.]
  is_visited BOOLEAN DEFAULT false,
  visited_at TIMESTAMP WITH TIME ZONE,
  visit_count INTEGER DEFAULT 0,
  
  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Food Routes/Journeys
CREATE TABLE public.food_routes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  estimated_duration INTEGER, -- in minutes
  estimated_cost INTEGER, -- in currency units
  difficulty_level TEXT DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'moderate', 'challenging')),
  
  -- Route Data
  waypoints JSONB NOT NULL DEFAULT '[]', -- [{place_id, order, notes}, ...]
  route_geometry JSONB, -- Encoded polyline from Google Directions
  
  -- Social & Sharing
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags JSONB DEFAULT '[]',
  season TEXT CHECK (season IN ('spring', 'summer', 'monsoon', 'winter', 'all')),
  best_time TEXT CHECK (best_time IN ('breakfast', 'lunch', 'dinner', 'snacks', 'anytime')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Social Features - Followers
CREATE TABLE public.user_followers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 6. Route Completion Tracking
CREATE TABLE public.route_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.food_routes(id) ON DELETE CASCADE,
  completed_waypoints JSONB DEFAULT '[]',
  completion_percentage INTEGER DEFAULT 0,
  total_cost INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  photos JSONB DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, route_id)
);

-- 7. Beta Invitations System
CREATE TABLE public.beta_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES public.user_profiles(id),
  invitation_code TEXT UNIQUE NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. User Activity Tracking
CREATE TABLE public.user_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL, -- "restaurant_saved", "route_created", "route_completed", etc.
  entity_type TEXT, -- "restaurant", "route", "user", etc.
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Restaurant Reviews & Ratings
CREATE TABLE public.restaurant_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photos JSONB DEFAULT '[]',
  helpful_count INTEGER DEFAULT 0,
  
  visit_date DATE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  group_size INTEGER DEFAULT 1,
  occasion TEXT, -- "date", "family", "business", "solo", etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, place_id)
);

-- 10. App Feedback & Support
CREATE TABLE public.app_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature_request', 'general', 'beta_feedback')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  
  app_version TEXT,
  device_info JSONB,
  screenshots JSONB DEFAULT '[]',
  
  admin_response TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 Create Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_user_profiles_tenant_id ON public.user_profiles(tenant_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_saved_restaurants_user_id ON public.saved_restaurants(user_id);
CREATE INDEX idx_saved_restaurants_place_id ON public.saved_restaurants(place_id);
CREATE INDEX idx_food_routes_user_id ON public.food_routes(user_id);
CREATE INDEX idx_food_routes_public ON public.food_routes(is_public) WHERE is_public = true;
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at);
CREATE INDEX idx_beta_invitations_email ON public.beta_invitations(email);
CREATE INDEX idx_beta_invitations_code ON public.beta_invitations(invitation_code);

-- Geospatial index for location-based queries
CREATE INDEX idx_saved_restaurants_location ON public.saved_restaurants USING GIST(ST_Point(longitude, latitude));
```

## 🔐 Step 3: Row Level Security (RLS) Policies

### 3.1 Enable RLS on All Tables
```sql
-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;
```

### 3.2 Create RLS Policies
```sql
-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_followers uf 
      WHERE uf.following_id = user_profiles.id 
      AND uf.follower_id = auth.uid()
    )
  );

-- Saved Restaurants Policies
CREATE POLICY "Users can manage their own saved restaurants" ON public.saved_restaurants
  FOR ALL USING (auth.uid() = user_id);

-- Food Routes Policies
CREATE POLICY "Users can manage their own routes" ON public.food_routes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public routes" ON public.food_routes
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- User Followers Policies
CREATE POLICY "Users can manage their own follows" ON public.user_followers
  FOR ALL USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Route Completions Policies
CREATE POLICY "Users can manage their own completions" ON public.route_completions
  FOR ALL USING (auth.uid() = user_id);

-- User Activity Policies
CREATE POLICY "Users can view their own activity" ON public.user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity" ON public.user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Restaurant Reviews Policies
CREATE POLICY "Users can manage their own reviews" ON public.restaurant_reviews
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all reviews" ON public.restaurant_reviews
  FOR SELECT USING (true);

-- App Feedback Policies
CREATE POLICY "Users can manage their own feedback" ON public.app_feedback
  FOR ALL USING (auth.uid() = user_id);

-- Beta Invitations Policies (Admin only for now)
CREATE POLICY "Service role can manage invitations" ON public.beta_invitations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

## 🔧 Step 4: Supabase Configuration

### 4.1 Authentication Settings
```bash
# Go to Authentication > Settings
# Configure:
# - Site URL: https://fuzo.app (or your domain)
# - Redirect URLs: https://fuzo.app/auth/callback
# - Email confirmation: Enabled
# - Email change confirmation: Enabled
# - Enable email signup: Yes
```

### 4.2 Auth Email Templates
```sql
-- Go to Authentication > Email Templates
-- Customize the confirmation and reset password emails
-- Use your brand colors and messaging
```

### 4.3 Database Functions for Beta Management
```sql
-- Function to check beta user limit
CREATE OR REPLACE FUNCTION check_beta_user_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_beta_user = true THEN
    IF (SELECT COUNT(*) FROM public.user_profiles WHERE is_beta_user = true) >= 50 THEN
      RAISE EXCEPTION 'Beta user limit of 50 has been reached';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce beta limit
CREATE TRIGGER check_beta_limit_trigger
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION check_beta_user_limit();

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, is_beta_user)
  VALUES (
    NEW.id,
    NEW.email,
    true -- All new users start as beta users
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 📦 Step 5: Install Supabase Dependencies

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install additional dependencies for the SaaS features
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
npm install react-query # for data fetching
npm install zustand # for state management
```

## 🔌 Step 6: Environment Setup

Create your `.env.local` file:
```bash
# Copy from env.production.example
cp env.production.example .env.local

# Fill in your actual Supabase values:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🧪 Step 7: Beta Testing Setup

### 7.1 Create Beta Invitation System
```sql
-- Insert initial beta invitation codes
INSERT INTO public.beta_invitations (email, invitation_code, expires_at)
VALUES 
  ('test1@example.com', 'FUZO_BETA_001', NOW() + INTERVAL '30 days'),
  ('test2@example.com', 'FUZO_BETA_002', NOW() + INTERVAL '30 days'),
  ('test3@example.com', 'FUZO_BETA_003', NOW() + INTERVAL '30 days');
```

### 7.2 Beta User Dashboard Query
```sql
-- Query to monitor beta program
SELECT 
  COUNT(*) as total_beta_users,
  COUNT(CASE WHEN last_active_at > NOW() - INTERVAL '7 days' THEN 1 END) as active_weekly,
  COUNT(CASE WHEN beta_feedback_provided = true THEN 1 END) as feedback_provided
FROM public.user_profiles 
WHERE is_beta_user = true;
```

## 🚀 Step 8: Deploy & Test

### 8.1 Test Database Connection
```typescript
// Test in your app
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

// Test connection
const { data, error } = await supabase.from('user_profiles').select('count')
console.log('Supabase connected:', { data, error })
```

### 8.2 Beta Launch Checklist
- [ ] Database schema deployed
- [ ] RLS policies active
- [ ] Authentication configured
- [ ] Email templates customized
- [ ] Beta invitations created
- [ ] Environment variables set
- [ ] App connection tested
- [ ] Monitoring dashboard ready

## 📊 Step 9: Monitoring & Analytics

### 9.1 Create Monitoring Views
```sql
-- Beta program analytics view
CREATE VIEW beta_analytics AS
SELECT 
  DATE(created_at) as signup_date,
  COUNT(*) as new_signups,
  COUNT(CASE WHEN last_active_at > NOW() - INTERVAL '7 days' THEN 1 END) as active_users
FROM public.user_profiles 
WHERE is_beta_user = true 
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- Popular restaurants view
CREATE VIEW popular_restaurants AS
SELECT 
  place_id,
  name,
  COUNT(*) as save_count,
  AVG(user_rating) as avg_rating
FROM public.saved_restaurants 
GROUP BY place_id, name 
ORDER BY save_count DESC;
```

Your Supabase multi-tenant SaaS setup is now complete! 🎉

## 🔗 Next Steps
1. Deploy your frontend to Vercel/Netlify
2. Test the complete user flow
3. Send out beta invitations
4. Monitor usage and gather feedback
5. Iterate based on user behavior

## 📞 Support
If you run into issues, check:
- Supabase logs in Dashboard > Logs
- RLS policies are properly configured
- Environment variables are correct
- Database schema matches your types 