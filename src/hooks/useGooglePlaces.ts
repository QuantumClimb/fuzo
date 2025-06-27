import { useState, useEffect } from 'react';

interface PlaceResult {
  place_id: string;
  name: string;
  rating: number;
  price_level?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  vicinity?: string;
  photos?: Array<{
    photo_reference: string;
  }>;
  opening_hours?: {
    open_now: boolean;
  };
}

import { Restaurant } from '@/types';

interface GooglePlaceResult {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  coordinates: { lat: number; lng: number };
  vicinity?: string;
  priceLevel?: number;
  photoReference?: string;
  openNow?: boolean;
}

interface UseGooglePlacesProps {
  location: { lat: number; lng: number };
  radius?: number;
  type?: string;
  keyword?: string;
  enabled?: boolean;
}

const convertPlaceToRestaurant = (place: google.maps.places.PlaceResult): Restaurant => {
  const priceRanges = ['$', '$$', '$$$', '$$$$'];
  const priceRange = place.price_level !== undefined ? priceRanges[place.price_level] || '$$' : '$$';
  
  return {
    id: place.place_id || Math.random().toString(),
    name: place.name || 'Unknown Restaurant',
    cuisine: getCuisineFromTypes(place.types || []),
    rating: place.rating || 0,
    priceRange,
    coordinates: {
      lat: place.geometry?.location?.lat() || 0,
      lng: place.geometry?.location?.lng() || 0,
    },
    address: place.vicinity || place.formatted_address || 'Address not available',
    hours: place.opening_hours ? (place.opening_hours.open_now ? 'Open now' : 'Currently closed') : 'Hours not available',
    image: place.photos?.[0] ? 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${(place.photos[0] as any).photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}` : 
      '/placeholder.svg',
    description: `${getCuisineFromTypes(place.types || [])} restaurant with ${place.rating || 'no'} star rating`,
    visitCount: Math.floor(Math.random() * 50) + 1, // Mock data for now
    phoneNumber: place.formatted_phone_number,
    website: place.website,
    reviewCount: place.user_ratings_total || 0,
    travelTimeMin: Math.floor(Math.random() * 30) + 5, // Mock travel time
  };
};

export const useGooglePlaces = ({
  location,
  radius = 5000,
  type = 'restaurant',
  keyword = '',
  enabled = true
}: UseGooglePlacesProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const searchPlaces = async () => {
    if (!enabled || !apiKey || !location.lat || !location.lng) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if Google Maps is loaded
      if (!window.google?.maps?.places) {
        throw new Error('Google Maps Places API not loaded');
      }

      // Note: Using legacy PlacesService - deprecation warnings are expected but API still works
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: type as any,
        keyword: keyword || undefined,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const mappedRestaurants: Restaurant[] = results.map(convertPlaceToRestaurant);
          setRestaurants(mappedRestaurants);
        } else {
          setError(`Places search failed: ${status}`);
        }
        setLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search places');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && apiKey && location.lat && location.lng) {
      // Add a small delay to ensure Google Maps is loaded
      const timer = setTimeout(searchPlaces, 500);
      return () => clearTimeout(timer);
    }
  }, [location.lat, location.lng, radius, type, keyword, enabled, apiKey]);

  return {
    restaurants,
    loading,
    error,
    refetch: searchPlaces,
    hasApiKey: !!apiKey,
  };
};

// Helper function to determine cuisine type from Google Places types
const getCuisineFromTypes = (types: string[]): string => {
  const cuisineMap: { [key: string]: string } = {
    'italian_restaurant': 'Italian',
    'japanese_restaurant': 'Japanese', 
    'chinese_restaurant': 'Chinese',
    'mexican_restaurant': 'Mexican',
    'indian_restaurant': 'Indian',
    'thai_restaurant': 'Thai',
    'french_restaurant': 'French',
    'american_restaurant': 'American',
    'pizza_restaurant': 'Pizza',
    'seafood_restaurant': 'Seafood',
    'steakhouse': 'Steakhouse',
    'sushi_restaurant': 'Japanese',
    'fast_food_restaurant': 'Fast Food',
    'coffee_shop': 'Coffee',
    'bakery': 'Bakery',
    'ice_cream_shop': 'Dessert',
  };

  // Check for specific cuisine types first
  for (const type of types) {
    if (cuisineMap[type]) {
      return cuisineMap[type];
    }
  }

  // Default fallback
  return 'Restaurant';
}; 