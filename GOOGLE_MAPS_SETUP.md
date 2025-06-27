# 🗺️ Google Maps API Setup Guide

## Quick Setup to Replace Mock Data with Real Google Maps

Your FUZO app is currently using mock restaurant data. Follow these steps to enable real Google Maps and Places API data:

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API** (for map display)
   - **Places API** (for restaurant search)
   - **Geocoding API** (optional, for address conversion)
   - **Directions API** (optional, for route planning)

4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key (starts with `AIza...`)

### Step 2: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Copy env_example.txt to .env.local first
cp env_example.txt .env.local
```

Then edit `.env.local` and replace:
```
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### Step 3: Restart Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

### Step 4: Test the Setup

1. Navigate to `/map-test` in your app to test the API
2. Or visit the main map at `/map` - you should see status indicators showing:
   - ❌ Red alert if API key missing
   - ⚠️ Orange alert if API error
   - 🔄 Blue alert while loading
   - ✅ Green alert when successfully using Google data

## What Changes After Setup

- **Before**: App uses mock restaurant data from JSON files
- **After**: App fetches real restaurants from Google Places API based on your location
- **Map**: Real Google Maps with street view and satellite imagery
- **Restaurants**: Live data with real ratings, photos, and hours
- **Search**: Real place search and autocomplete

## Cost Information

- Google Maps provides $200/month free credit
- Typical usage for development: ~$5-20/month
- Each map load: ~$0.007
- Each restaurant search: ~$0.032

## Troubleshooting

### If you see "API key not configured":
- Check `.env.local` file exists in project root
- Verify `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- Restart your dev server

### If you see "Places search failed":
- Ensure Places API is enabled in Google Cloud Console
- Check API key restrictions (allow your domain)
- Verify billing is enabled on your Google Cloud project

### If map doesn't load:
- Check browser console for errors
- Ensure Maps JavaScript API is enabled
- Try accessing `/map-test` for detailed diagnostics

## Free Development Setup

For basic testing without API costs:
1. Use the mock data (current setup)
2. Only enable Maps JavaScript API initially
3. Add Places API when ready for live data

The app automatically falls back to mock data if the API is unavailable, so you can develop with or without the API key. 