# 🚀 FUZO Multi-Tenant SaaS Variables Checklist

## Core Platform Variables

### 🔐 Authentication & User Management (Supabase)
```env
# Supabase Core
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Server-side only

# JWT Settings
SUPABASE_JWT_SECRET=your-jwt-secret
VITE_SUPABASE_AUTH_REDIRECT_URL=https://fuzo.app/auth/callback

# Email Auth Settings
VITE_ENABLE_EMAIL_SIGNUP=true
VITE_ENABLE_SOCIAL_LOGIN=true
```

### 🏢 Multi-Tenant Configuration
```env
# Tenant Management
VITE_DEFAULT_TENANT_PLAN=beta
VITE_MAX_BETA_USERS=50
VITE_BETA_ACCESS_CODE=FUZO_BETA_2024
VITE_REQUIRE_INVITATION=true

# Tenant Limits (Beta)
VITE_BETA_SAVED_RESTAURANTS_LIMIT=100
VITE_BETA_ROUTES_LIMIT=10
VITE_BETA_FRIENDS_LIMIT=25
```

### 🗺️ Maps & Location Services
```env
# Google Maps Platform
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC...
VITE_GOOGLE_PLACES_API_KEY=AIzaSyD...
VITE_GOOGLE_DIRECTIONS_API_KEY=AIzaSyE...
VITE_GOOGLE_GEOCODING_API_KEY=AIzaSyF...

# Alternative/Fallback
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1...
```

### 🍽️ Restaurant Data APIs
```env
# Primary Data Sources
VITE_YELP_API_KEY=Bearer your-yelp-key
VITE_FOURSQUARE_API_KEY=fsq3...
VITE_ZOMATO_API_KEY=your-zomato-key

# Data Enrichment
VITE_SPOONACULAR_API_KEY=your-spoonacular-key # Food data
```

### 🤖 AI & Machine Learning
```env
# OpenAI for Recommendations
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_MODEL=gpt-4
VITE_OPENAI_MAX_TOKENS=500

# Alternative AI
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_AI_API_KEY=AIzaSy...
```

### 📸 Media & Storage
```env
# Cloudinary for Images
VITE_CLOUDINARY_CLOUD_NAME=your-cloud
VITE_CLOUDINARY_API_KEY=123456789
VITE_CLOUDINARY_API_SECRET=secret
VITE_CLOUDINARY_UPLOAD_PRESET=fuzo_uploads

# Alternative Storage
VITE_AWS_S3_BUCKET=fuzo-user-uploads
VITE_AWS_REGION=ap-south-1 # Mumbai region for India
```

### 💳 Payments & Billing (Future)
```env
# Stripe for Subscriptions
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_... # Server-side only
STRIPE_WEBHOOK_SECRET=whsec_...

# Indian Payment Gateway
VITE_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=... # Server-side only
```

### 📧 Communication
```env
# Email Services
VITE_RESEND_API_KEY=re_... # Modern email service
SENDGRID_API_KEY=SG.... # Alternative

# SMS for India
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Push Notifications
VITE_VAPID_PUBLIC_KEY=BH...
VAPID_PRIVATE_KEY=... # Server-side
```

### 📊 Analytics & Monitoring
```env
# User Analytics
VITE_POSTHOG_KEY=phc_... # Privacy-focused analytics
VITE_MIXPANEL_TOKEN=... # User behavior
VITE_GA_MEASUREMENT_ID=G-... # Google Analytics

# Error Tracking
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=... # For releases

# Performance Monitoring
VITE_VERCEL_ANALYTICS_ID=... # If using Vercel
```

### 🔒 Security & Compliance
```env
# API Security
VITE_API_BASE_URL=https://api.fuzo.app
API_RATE_LIMIT_MAX=100 # requests per minute
API_RATE_LIMIT_WINDOW=60000 # 1 minute

# Data Protection
ENCRYPTION_KEY=... # For sensitive data
VITE_ENABLE_DATA_EXPORT=true # GDPR compliance
```

## 🏗️ Supabase Database Schema for Multi-Tenancy

### Core Tables Structure

```sql
-- Tenants/Organizations
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  plan TEXT DEFAULT 'beta',
  max_users INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Users with Tenant Association
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  dietary_preferences JSONB,
  location_preferences JSONB,
  is_beta_user BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User's Saved Restaurants
CREATE TABLE saved_restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  restaurant_id TEXT NOT NULL, -- Google Place ID
  restaurant_data JSONB, -- Cached restaurant info
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  visited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Food Routes/Journeys
CREATE TABLE food_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  waypoints JSONB, -- Array of coordinates and restaurants
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social Features
CREATE TABLE user_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES user_profiles(id),
  following_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Beta Invitations
CREATE TABLE beta_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES user_profiles(id),
  invitation_code TEXT UNIQUE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage Analytics
CREATE TABLE user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Beta Testing Strategy (50 Users)

### Phase 1: Invite-Only Beta (Week 1-2)
```env
# Beta Configuration
VITE_BETA_MODE=true
VITE_BETA_SIGNUP_ENABLED=false
VITE_INVITE_ONLY=true
VITE_BETA_WAITLIST_ENABLED=true
```

### Phase 2: Limited Public Beta (Week 3-4)
```env
VITE_BETA_SIGNUP_ENABLED=true
VITE_BETA_ACCESS_CODE=FUZO_BETA_2024
VITE_MAX_DAILY_SIGNUPS=5
```

### Phase 3: Feature Testing (Week 5-6)
```env
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_ROUTE_SHARING=true
VITE_ENABLE_AI_RECOMMENDATIONS=true
```

## 🚀 Environment Setup by Deployment Stage

### Development
```env
NODE_ENV=development
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_API_BASE_URL=http://localhost:3000
```

### Staging/Beta
```env
NODE_ENV=production
VITE_APP_ENV=staging
VITE_DEBUG_MODE=false
VITE_API_BASE_URL=https://api-staging.fuzo.app
VITE_BETA_MODE=true
```

### Production
```env
NODE_ENV=production
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_API_BASE_URL=https://api.fuzo.app
VITE_BETA_MODE=false
```

## 📋 Priority Implementation Order

### Week 1: Core Setup
1. **Supabase project setup**
2. **User authentication**
3. **Basic database schema**
4. **Google Maps integration**

### Week 2: Beta Features
1. **Invitation system**
2. **User profiles**
3. **Restaurant saving**
4. **Basic social features**

### Week 3: Advanced Features
1. **Route planning**
2. **AI recommendations**
3. **Mobile PWA**
4. **Analytics setup**

### Week 4: Beta Launch
1. **Testing and bug fixes**
2. **Performance optimization**
3. **Beta user onboarding**
4. **Feedback collection**

## 🔧 Supabase Configuration Commands

```bash
# Initialize Supabase
npx supabase init
npx supabase start

# Set up authentication
npx supabase gen types typescript --local > src/types/supabase.ts

# Deploy to production
npx supabase db push
npx supabase functions deploy
```

This comprehensive setup will give you a solid foundation for your multi-tenant SaaS food discovery platform! 🚀 