# 🚀 FUZO App Deployment Guide

## Quick Deploy to Get Real Google Maps Power

Your app needs to be on the internet (HTTPS) to unlock the full potential of Google Maps API, especially for location detection and restaurant searches.

## Option 1: Vercel (Recommended - Free & Fast)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
# From your project root
vercel

# Follow the prompts:
# Set up and deploy? Y
# Which scope? [your-account]
# Link to existing project? N
# What's your project's name? fuzo-food-app
# In which directory is your code located? ./
```

### Step 3: Configure Environment Variables
```bash
# Add your Google Maps API key securely
vercel env add VITE_GOOGLE_MAPS_API_KEY
# Paste your actual API key when prompted
```

### Step 4: Redeploy with Environment Variables
```bash
vercel --prod
```

**Your app will be live at:** `https://fuzo-food-app.vercel.app`

## Option 2: Netlify (Alternative)

### Step 1: Build for Production
```bash
npm run build
```

### Step 2: Install Netlify CLI
```bash
npm i -g netlify-cli
```

### Step 3: Deploy
```bash
netlify deploy --prod --dir=dist
```

## Option 3: GitHub Pages + GitHub Actions

### Step 1: Create `.github/workflows/deploy.yml`
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
        env:
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Step 2: Add API Key to GitHub Secrets
1. Go to repository Settings → Secrets and variables → Actions
2. Add `VITE_GOOGLE_MAPS_API_KEY` with your API key value

## What Changes After Deployment

### ✅ **Location Detection**
- **Before**: Browser blocks location on localhost
- **After**: HTTPS enables reliable geolocation
- **Result**: Automatic detection of user's exact coordinates

### ✅ **Google Maps API**
- **Before**: Limited functionality, CORS issues
- **After**: Full API access, better performance
- **Result**: Real restaurant data, photos, ratings

### ✅ **Progressive Web App Features**
- **After deployment**: Can be installed as mobile app
- **Offline capabilities**: Service worker support
- **Push notifications**: Real-time restaurant updates

## Google Cloud Console Updates

After deployment, update your API key restrictions:

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Navigate to**: APIs & Services → Credentials
3. **Edit your API key**
4. **HTTP referrers**: Add your live domain
   ```
   https://your-app-name.vercel.app/*
   https://your-custom-domain.com/*
   ```

## Testing Live Features

Once deployed, test these features that only work on HTTPS:

### 🎯 **Location-Based Features**
- Automatic location detection
- "Near me" restaurant search
- Real-time distance calculations

### 🗺️ **Enhanced Maps**
- Street view integration
- Satellite imagery
- Real-time traffic data

### 📱 **Mobile Features**
- Install as PWA
- Native-like experience
- Offline functionality

## Performance Optimizations for Production

Your `vite.config.ts` is already optimized, but after deployment you can add:

### CDN for Assets
```javascript
// Add to vite.config.ts
export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          maps: ['@googlemaps/react-wrapper']
        }
      }
    }
  }
})
```

## Expected Results After Deployment

### 🔥 **Before (localhost)**
- Mock restaurant data
- Location detection blocked
- Limited API functionality

### 🚀 **After (HTTPS deployment)**
- Real restaurants from Google Places API
- Automatic location detection in India
- Full photo gallery from Google
- Real ratings and reviews
- Mobile app-like experience

## Quick Deploy Command

```bash
# One-command deploy to Vercel
npx vercel --prod

# Or if you prefer Netlify
npx netlify deploy --prod --dir=dist
```

**Choose your deployment platform and let's get your FUZO app live!** 🌟

The real magic of location-based restaurant discovery will shine once it's deployed on HTTPS! 