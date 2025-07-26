# FUZO - Social Food Discovery & Location Sharing

## 🚨 2024 Update: Complete App Overhaul & Production Ready

- **🎯 Production Deployment**: Successfully deployed on Vercel with full CI/CD pipeline
- **📸 Camera & Storage**: Complete camera functionality with Edge Function upload to Supabase Storage
- **🎨 UI/UX Improvements**: Roundo font implementation, responsive design, and modern iOS-style interface
- **🗺️ Location Services**: Enhanced geolocation with high-accuracy GPS detection
- **🔧 Technical Fixes**: Resolved TypeScript errors, CSS warnings, and build issues
- **📱 Mobile-First**: Optimized for mobile with bottom navigation and touch-friendly interactions

A modern mobile-first React application that combines social media with location-based restaurant discovery. Share your dining experiences, discover new restaurants, and connect with fellow food enthusiasts.

## 🚀 Quick Start

**Live Demo**: [https://fuzo.vercel.app](https://fuzo.vercel.app)

**Key Features**:
- 📸 **Camera**: Take photos with live preview and GPS location tracking
- 🗺️ **Location**: High-accuracy GPS detection for nearby restaurant discovery
- 📱 **Feed**: View and share food photos with location data
- 🎯 **Search**: Find restaurants near your current location or search by area
- 👤 **Profile**: Manage your account and access radar functionality

## 🚀 Features

- **📱 Social Feed**: Instagram-style feed for sharing food and dining experiences
- **🎯 Restaurant Radar**: Location-based restaurant discovery with filtering and live map
- **📸 Camera Integration**: Capture and share photos with geolocation
- **🗺️ Location Services**: Real-time geolocation for restaurant recommendations
- **🏷️ Smart Filtering**: Filter restaurants by cuisine, price, and rating
- **📍 Toronto Focus**: Curated content and restaurants in the Toronto area
- **🔎 Location-First Search**: Search for locations first, then view restaurants in the selected area (Google Places API)
- **🖼️ Google Places Photo Attribution**: Restaurant images display required attributions per Google's policy
- **🗺️ Enhanced Radar**: Interactive map with "Detect My Location" and a distance slider (50m–5000m) to filter nearby restaurants
- **🎨 Custom Typography**: Beautiful Roundo font implementation for modern UI
- **📱 Mobile Navigation**: Bottom navigation bar for easy thumb access
- **🔄 Real-time Updates**: Live camera feed and instant photo uploads

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query + React Hook Form
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Validation**: Zod schema validation
- **Development**: ESLint + Modern TypeScript config
- **Backend**: Supabase (Auth, Storage, Edge Functions)
- **Deployment**: Vercel with CI/CD
- **Maps**: Google Maps Platform (Places API, Geocoding API)
- **Typography**: Roundo font family

## 📦 Installation

### Prerequisites
- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/QuantumClimb/fuzo.git
   cd fuzo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:8080`

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Feed.tsx        # Social media feed (image-only from Supabase)
│   ├── RadarWithGoogleMaps.tsx # Enhanced radar with map & filters
│   ├── Camera.tsx      # Photo capture with live feed
│   ├── QuickSearch.tsx # Location-based restaurant search
│   ├── VideoFeed.tsx   # Video content feed
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useGeolocation.ts # High-accuracy GPS detection
│   ├── useGoogleMaps.ts # Google Maps integration
│   └── ...
├── pages/              # Page components
│   ├── Index.tsx       # Main app with navigation
│   ├── Profile.tsx     # User profile with radar integration
│   └── ...
├── lib/                # Utility functions
│   ├── supabaseClient.ts # Supabase configuration
│   ├── googleMaps.ts   # Google Maps utilities
│   └── ...
└── types/              # TypeScript type definitions

supabase/
├── functions/          # Edge Functions
│   └── upload-guest-image/ # Image upload handler
├── migrations/         # Database migrations
└── config.toml        # Supabase configuration
```

## 🔧 Recent Technical Improvements

### **Production Deployment**
- ✅ **Vercel Integration**: Full CI/CD pipeline with automatic deployments
- ✅ **Environment Variables**: Properly configured for production
- ✅ **Build Optimization**: Resolved all build warnings and errors

### **Database & Swipe Foundation**
- ✅ **User Saved Items Table**: `user_saved_items` for swipe-right functionality
- ✅ **User Hidden Items Table**: `user_hidden_items` for swipe-left functionality
- ✅ **Row Level Security**: Secure user data isolation with RLS policies
- ✅ **Performance Indexes**: Optimized database queries for fast swipe operations
- ✅ **Migration System**: Proper database versioning and deployment

### **Camera & Storage System**
- ✅ **Live Camera Feed**: Real-time video preview before capture
- ✅ **Edge Function Upload**: Secure image upload via Supabase Edge Function
- ✅ **Location Tracking**: GPS coordinates embedded in filenames
- ✅ **Feed Integration**: Automatic display of uploaded images

### **UI/UX Enhancements**
- ✅ **Roundo Font**: Custom typography implementation
- ✅ **Mobile Navigation**: Bottom navigation bar for thumb access
- ✅ **Responsive Design**: Optimized for all screen sizes
- ✅ **iOS-Style Interface**: Modern glassmorphism design

### **Location Services**
- ✅ **High-Accuracy GPS**: Enhanced geolocation with 30-second timeout
- ✅ **Location Source Detection**: GPS, Network, or IP-based fallback
- ✅ **Real-time Updates**: Live location detection and restaurant search

### **Technical Debt Resolution**
- ✅ **TypeScript Errors**: Resolved all type checking issues
- ✅ **CSS Warnings**: Fixed @import statement ordering
- ✅ **Build Issues**: Eliminated all build warnings
- ✅ **Code Quality**: Improved error handling and debugging

## 🎯 Current Milestone: Swipe Functionality Implementation

### **📱 Mobile Swipe Gestures (In Progress)**
- **Swipe Right**: Save restaurant/food item to user's saved items
- **Swipe Left**: Hide item from user's feed (never show again)
- **Visual Feedback**: Green overlay for save, red overlay for hide
- **Gesture Detection**: Touch-based swipe with threshold detection
- **Database Integration**: Real-time save/hide operations
- **Feed Filtering**: Automatic removal of hidden items from feed

### **🛠️ Implementation Plan**
1. **Phase 1: Database Setup** ✅ **COMPLETED**
   - Created `user_saved_items` and `user_hidden_items` tables
   - Implemented Row Level Security policies
   - Added performance indexes for fast queries

2. **Phase 2: Core Swipe Component** 🔄 **IN PROGRESS**
   - Create `SwipeableCard` component with gesture detection
   - Implement visual feedback and animations
   - Add haptic feedback for mobile devices

3. **Phase 3: Backend Integration** 📋 **PLANNED**
   - Supabase Edge Functions for save/hide operations
   - Real-time feed updates and filtering
   - User preference management

4. **Phase 4: Feed Integration** 📋 **PLANNED**
   - Replace current cards with swipeable versions
   - Implement feed filtering logic
   - Add loading states and error handling

5. **Phase 5: User Experience** 📋 **PLANNED**
   - Settings for swipe sensitivity
   - Saved items management page
   - Undo functionality for accidental swipes

## 🎨 Components Overview

### Onboarding Component
- **First-time user experience**: Interactive slides introducing app features
- **5-step walkthrough**: Discover Hidden Food Spots, Radar Mode, Snap & Share, Curated Feed, Scout Network
- **Skip functionality**: Users can skip onboarding at any time
- **Progress indicators**: Visual dots showing current slide position
- **Responsive design**: Optimized for mobile and desktop
- **Local storage**: Remembers if user has completed onboarding

### Feed Component
- **Image-Only Feed**: Displays photos uploaded via camera component
- **Supabase Integration**: Real-time image retrieval from `guestimages` bucket
- **Location Tracking**: Images include GPS coordinates in filenames
- **Time-based Sorting**: Newest images appear first
- **Responsive Grid**: Optimized layout for mobile and desktop
- **Public URLs**: Direct access to uploaded images via Supabase Storage

### Camera Component
- **Live Video Feed**: Real-time camera preview before capture
- **Photo Capture**: High-quality image capture with canvas
- **Location Integration**: GPS coordinates embedded in filenames
- **Edge Function Upload**: Secure upload to Supabase Storage
- **Progress Feedback**: Upload status and error handling
- **Mobile Optimized**: Touch-friendly interface with iOS styling

### RadarWithGoogleMaps Component
- Real-time location-based restaurant discovery
- Interactive map with "Detect My Location"
- Cuisine filtering (Steakhouse, Thai, Japanese, Canadian)
- **Distance slider**: Filter restaurants by adjustable radius (50m–5000m)
- Restaurant cards with ratings, prices, and distances
- Geolocation permission handling

### Camera Component
- Native camera access with front/back switching
- Photo capture with canvas processing
- Caption and location tagging
- Photo download functionality

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🧪 Testing Features

### Onboarding Testing
To test the onboarding flow, you can reset the onboarding state:

```javascript
// In browser console
localStorage.removeItem('hasSeenOnboarding');
// Then refresh the page
```

Or use the utility function in your code:
```javascript
import { resetOnboarding } from './lib/utils';
resetOnboarding();
```

## 🌐 Deployment

### Git Configuration for CI/CD
This project includes a `prepare` script and config section in `package.json` to ensure all git commits use the correct identity for QuantumClimb:

```json
"scripts": {
  ...
  "prepare": "git config user.name 'Quantum Climb' && git config user.email 'quantumclimb@users.noreply.github.com'"
},
"config": {
  "gitUser": "Quantum Climb",
  "gitEmail": "quantumclimb@users.noreply.github.com"
}
```

This prevents permission and email privacy issues during deployment.

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Deploy automatically on every push

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Other Platforms
The app builds to static files in the `dist` directory and can be deployed to any static hosting service.

## 🔐 Environment Variables

The app requires Google Maps API integration for full functionality. Create a `.env` file in the root directory:

```env
# Required: Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Optional: Backend API URL (if using a backend service)
VITE_API_BASE_URL=https://your-api-endpoint.com

# Optional: App environment
VITE_APP_ENV=development
```

### 🗺️ **Google Maps API Setup**

1. **Get Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the following APIs:
     - Places API
     - Maps JavaScript API
     - Geocoding API
     - Maps Static API (optional)
   - Create credentials (API Key)
   - Restrict the API key (recommended for production)

2. **API Restrictions (Production):**
   ```
   Application restrictions: HTTP referrers (web sites)
   Website restrictions: Add your domain(s)
   API restrictions: Select specific APIs listed above
   ```

3. **Required Google Maps APIs:**
   - **Places API** - Restaurant search and details
   - **Geocoding API** - Address resolution
   - **Maps JavaScript API** - Interactive maps
   - **Maps Static API** - Static map images

### 📊 **Google Maps API Usage:**

- **Location-First Search**: Search for a location, then view restaurants in that area
- **Restaurant Discovery**: Real-time nearby restaurant search
- **Place Details**: Complete restaurant information (hours, photos, contact)
- **Reverse Geocoding**: Convert coordinates to readable addresses
- **Place Photos**: High-quality restaurant images with required attributions
- **Static Maps**: Location visualization

**Without API Key**: App falls back to mock data for development.

## 🚀 Deployment

### **Production Environment**
- **Platform**: Vercel with automatic deployments
- **URL**: https://fuzo.vercel.app
- **CI/CD**: Automatic deployment on git push to main branch
- **Environment Variables**: Configured for production use

### **Environment Setup**
Create a `.env` file with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### **Supabase Configuration**
- **Storage Bucket**: `guestimages` for image uploads
- **Edge Function**: `upload-guest-image` for secure file handling
- **Authentication**: Guest user system for demo/testing
- **Database**: PostgreSQL with Row Level Security (RLS)

## 📱 Mobile Optimization

- **Responsive Design**: Mobile-first approach with desktop optimization
- **Touch-Friendly**: Large touch targets and intuitive gestures
- **Bottom Navigation**: Thumb-accessible navigation bar
- **PWA-Ready**: Proper meta tags and service worker support
- **Performance**: Optimized for various screen sizes and network conditions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for backend services and Edge Functions
- [Vercel](https://vercel.com/) for hosting and deployment platform
- [Google Maps Platform](https://developers.google.com/maps) for location and places APIs
- [Roundo Font](https://www.behance.net/gallery/123456789/Roundo-Font) for custom typography
- [Lucide](https://lucide.dev/) for the comprehensive icon set
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- Toronto restaurant community for inspiration and testing

## 🗄️ Database Schema

### **Swipe Functionality Tables**

#### **user_saved_items**
Stores items that users save by swiping right:
```sql
CREATE TABLE user_saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('restaurant', 'food_post', 'video')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **user_hidden_items**
Stores items that users hide by swiping left:
```sql
CREATE TABLE user_hidden_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('restaurant', 'food_post', 'video')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Performance Indexes**
- `idx_user_saved_items_user_id` - Fast user queries
- `idx_user_saved_items_item_type` - Filter by item type
- `idx_user_saved_items_user_type` - Composite index for common queries
- `idx_user_hidden_items_user_id` - Fast user queries
- `idx_user_hidden_items_item_type` - Filter by item type
- `idx_user_hidden_items_user_type` - Composite index for common queries

#### **Security**
- **Row Level Security (RLS)**: Enabled on both tables
- **User Isolation**: Users can only access their own saved/hidden items
- **Policy Enforcement**: Automatic filtering based on authenticated user

## 🔐 Authentication Flow (Updated)

- The app uses Supabase Auth for user authentication.
- Users can now sign in with their own email and password, or use the built-in guest account.
- The login page provides:
  - Email and password input fields for user login
  - A button for guest login (email: guest@example.com, password: guestpassword)

### Usage Example

1. **User Login:**
   - Enter your email and password in the login form and click ENTER.
   - If credentials are valid, you will be logged in and redirected to the app.

2. **Guest Login:**
   - Click the "Sign in as Guest" button to log in with the guest account.
   - Useful for demo/testing without creating a new user.

- All user data is protected with Row Level Security (RLS) policies in Supabase.
- For now, all data is associated with the guest user or the logged-in user, but the structure is ready for scaling to multiple users.

## Camera Image Upload (Edge Function)

Images captured in the Camera component are uploaded to Supabase Storage using the `upload-guest-image` Edge Function.

- **Bucket:** `guestimages`
- **Folder:** `guest/`
- **Upload Type:** Edge Function with CORS support

### Camera Functionality Flow

1. **Camera Activation**: User clicks "Start Camera" → Camera stream obtained and video feed displayed
2. **Photo Capture**: User clicks "Take Photo" → Image captured with canvas and saved to local storage
3. **Filename Generation**: Creates filename with timestamp and coordinates: `guest-image-{timestamp}-{lat}_{lng}.jpg`
4. **Upload Process**: User clicks "Upload to Feed" → Image uploaded to `guestimages/guest/` folder via Edge Function
5. **Feed Display**: Feed component retrieves images from `guestimages/guest/` folder and displays them

### Example Upload Logic
```js
// Camera component uploads via Edge Function
const formData = new FormData();
formData.append('file', blob, filename);
formData.append('filename', filename);

const uploadResponse = await fetch(`${supabaseUrl}/functions/v1/upload-guest-image`, {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
  },
});
```

### Feed Component Retrieval
```js
// Feed component retrieves from guestimages bucket
const { data: files, error } = await supabase.storage
  .from('guestimages')
  .list('guest', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  });

// Get public URLs
const { data: urlData } = supabase.storage
  .from('guestimages')
  .getPublicUrl(`guest/${file.name}`);
```

### Notes
- The `guestimages` bucket must exist in Supabase project
- Edge Function handles CORS and file upload validation
- Images are stored in `guestimages/guest/` folder structure
- Filename includes timestamp and GPS coordinates for location tracking
