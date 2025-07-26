# QuantumClimb - Social Food Discovery & Location Sharing

## 🚨 2024 Update: Google Maps Place API Migration & Robustness Improvements

- **Full migration to the new Google Maps Place API**: The app now exclusively uses the new Place API for all restaurant search and details, ensuring future compatibility and compliance with Google’s deprecation of legacy PlacesService.
- **Robust feed and details handling**: Restaurant names and images are now always shown in the feed, and the details page is resilient to missing or malformed data.
- **Error handling**: Defensive checks and filtering prevent crashes from undefined or missing fields (e.g., photos, names). The UI only displays valid data, and logs are added for easier debugging.
- **.env setup required**: Ensure your `.env` file contains a valid `VITE_GOOGLE_MAPS_API_KEY` for full functionality.

A modern mobile-first React application that combines social media with location-based restaurant discovery. Share your dining experiences, discover new restaurants, and connect with fellow food enthusiasts.

## 🚀 Features

- **📱 Social Feed**: Instagram-style feed for sharing food and dining experiences
- **🎯 Restaurant Radar**: Location-based restaurant discovery with filtering and live map
- **📸 Camera Integration**: Capture and share photos with geolocation
- **🗺️ Location Services**: Real-time geolocation for restaurant recommendations
- **🏷️ Smart Filtering**: Filter restaurants by cuisine, price, and rating
- **📍 Toronto Focus**: Curated content and restaurants in the Toronto area
- **🔎 Location-First Search**: Search for locations first, then view restaurants in the selected area (Google Places API)
- **🖼️ Google Places Photo Attribution**: Restaurant images display required attributions per Google’s policy
- **🗺️ Enhanced Radar**: Interactive map with "Detect My Location" and a distance slider (50m–5000m) to filter nearby restaurants

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query + React Hook Form
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Validation**: Zod schema validation
- **Development**: ESLint + Modern TypeScript config

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
│   ├── Feed.tsx        # Social media feed
│   ├── RadarWithGoogleMaps.tsx # Enhanced radar with map & filters
│   ├── Camera.tsx      # Photo capture
│   └── ...
├── hooks/              # Custom React hooks
├── data/               # Mock data and constants
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── pages/              # Page components
```

## 🎨 Components Overview

### Onboarding Component
- **First-time user experience**: Interactive slides introducing app features
- **5-step walkthrough**: Discover Hidden Food Spots, Radar Mode, Snap & Share, Curated Feed, Scout Network
- **Skip functionality**: Users can skip onboarding at any time
- **Progress indicators**: Visual dots showing current slide position
- **Responsive design**: Optimized for mobile and desktop
- **Local storage**: Remembers if user has completed onboarding

### Feed Component
- Social media style posts with images and captions
- Interactive like, comment, and share buttons
- Restaurant post integration with detailed views
- Time-based post sorting
- **Location-first search**: Search for a location, then view restaurants in that area
- **Google Places photo attribution**: Attributions shown under restaurant images

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

## 📱 Mobile Optimization

- Responsive design with mobile-first approach
- Touch-friendly interactions
- Bottom navigation for thumb accessibility
- PWA-ready with proper meta tags
- Optimized for various screen sizes

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
- [Unsplash](https://unsplash.com/) for placeholder images
- [Lucide](https://lucide.dev/) for the icon set
- Toronto restaurant community for inspiration
- Google Maps Platform for location and places APIs

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
