# newBuzo - Food Discovery & Social Sharing

A modern mobile-first React application that combines social media with location-based restaurant discovery. Share your dining experiences, discover new restaurants, and connect with fellow food enthusiasts.

## 🚀 Features

- **📱 Social Feed**: Instagram-style feed for sharing food and dining experiences
- **🎯 Restaurant Radar**: Location-based restaurant discovery with filtering
- **📸 Camera Integration**: Capture and share photos with geolocation
- **🗺️ Location Services**: Real-time geolocation for restaurant recommendations
- **🏷️ Smart Filtering**: Filter restaurants by cuisine, price, and rating
- **📍 Toronto Focus**: Curated content and restaurants in the Toronto area

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
   git clone <your-repo-url>
   cd newBuzo
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
│   ├── Radar.tsx       # Restaurant discovery
│   ├── Camera.tsx      # Photo capture
│   └── ...
├── hooks/              # Custom React hooks
├── data/               # Mock data and constants
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── pages/              # Page components
```

## 🎨 Components Overview

### Feed Component
- Social media style posts with images and captions
- Interactive like, comment, and share buttons
- Restaurant post integration with detailed views
- Time-based post sorting

### Radar Component
- Real-time location-based restaurant discovery
- Cuisine filtering (Steakhouse, Thai, Japanese, Canadian)
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

## 🌐 Deployment

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
   - **Maps JavaScript API** - Interactive maps (future feature)
   - **Maps Static API** - Static map images

### 📊 **Google Maps API Usage:**

- **Restaurant Discovery**: Real-time nearby restaurant search
- **Place Details**: Complete restaurant information (hours, photos, contact)
- **Reverse Geocoding**: Convert coordinates to readable addresses
- **Place Photos**: High-quality restaurant images
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
