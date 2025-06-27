import { useState, useEffect } from 'react';
import { Restaurant } from '@/types';

interface UseGooglePlacesProps {
  location: { lat: number; lng: number };
  radius?: number;
  type?: string;
  keyword?: string;
  enabled?: boolean;
}

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

// Enhanced interface for detailed restaurant data
interface DetailedRestaurant extends Restaurant {
  googlePlaceId?: string;
  detailedPhotos?: string[];
  detailedReviews?: GoogleReview[];
  businessStatus?: string;
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  openingHours?: google.maps.places.PlaceOpeningHours;
  geometry?: google.maps.places.PlaceGeometry;
  utc_offset_minutes?: number;
  price_level?: number;
  types?: string[];
  url?: string;
  user_ratings_total?: number;
  vicinity?: string;
  website?: string;
}

interface GoogleReview {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description?: string;
  text: string;
  time: number;
}

const convertPlaceToRestaurant = (place: google.maps.places.PlaceResult): DetailedRestaurant => {
  const priceRanges = ['$', '$$', '$$$', '$$$$'];
  const priceRange = place.price_level !== undefined ? priceRanges[place.price_level] || '$$' : '$$';
  
  // Get multiple photos if available
  const detailedPhotos = place.photos?.slice(0, 5).map(photo => 
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${(photo as any).photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
  ) || [];

  // Convert Google reviews to our format
  const googleReviews = place.reviews || [];
  const convertedReviews = googleReviews.map(review => ({
    userId: review.author_name?.replace(/\s+/g, '_').toLowerCase() || 'unknown',
    rating: review.rating || 0,
    text: review.text || '',
    date: review.time ? new Date(review.time * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    author_name: review.author_name || 'Anonymous',
    author_url: review.author_url,
    profile_photo_url: review.profile_photo_url,
    relative_time_description: review.relative_time_description
  }));
  
  return {
    id: place.place_id || Math.random().toString(),
    googlePlaceId: place.place_id,
    name: place.name || 'Unknown Restaurant',
    cuisine: getCuisineFromTypes(place.types || []),
    rating: place.rating || 0,
    priceRange,
    coordinates: {
      lat: place.geometry?.location?.lat() || 0,
      lng: place.geometry?.location?.lng() || 0,
    },
    address: place.vicinity || place.formatted_address || 'Address not available',
    formattedAddress: place.formatted_address,
    vicinity: place.vicinity,
    hours: formatOpeningHours(place.opening_hours),
    image: place.photos?.[0] ? 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${(place.photos[0] as any).photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}` : 
      '/placeholder.svg',
    detailedPhotos,
    description: generateDescription(place),
    visitCount: Math.floor(Math.random() * 50) + 1, // Mock data for now
    phoneNumber: place.formatted_phone_number,
    internationalPhoneNumber: place.international_phone_number,
    website: place.website,
    url: place.url, // Google Maps URL
    reviewCount: place.user_ratings_total || 0,
    reviews: convertedReviews,
    detailedReviews: googleReviews as GoogleReview[],
    travelTimeMin: Math.floor(Math.random() * 30) + 5, // Mock travel time - will enhance with Directions API
    businessStatus: place.business_status,
    openingHours: place.opening_hours,
    price_level: place.price_level,
    types: place.types,
    utc_offset_minutes: place.utc_offset_minutes,
    user_ratings_total: place.user_ratings_total,
    geometry: place.geometry,
    visitedByFriends: [] // This would come from your user data
  };
};

// Enhanced hook with detailed place information
export const useGooglePlaces = ({
  location,
  radius = 5000,
  type = 'restaurant',
  keyword = '',
  enabled = true
}: UseGooglePlacesProps) => {
  const [restaurants, setRestaurants] = useState<DetailedRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const getPlaceDetails = async (placeId: string): Promise<google.maps.places.PlaceResult | null> => {
    return new Promise((resolve) => {
      if (!window.google?.maps?.places) {
        resolve(null);
        return;
      }

      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: [
          'place_id', 'name', 'rating', 'user_ratings_total', 'price_level',
          'formatted_address', 'vicinity', 'geometry', 'photos', 'types',
          'opening_hours', 'formatted_phone_number', 'international_phone_number',
          'website', 'url', 'reviews', 'business_status', 'utc_offset_minutes'
        ]
      };

      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          resolve(null);
        }
      });
    });
  };

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

      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: type as any,
        keyword: keyword || undefined,
      };

      service.nearbySearch(request, async (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Get detailed information for each place
          const detailedRestaurants: DetailedRestaurant[] = [];
          
          // Limit to first 20 results to avoid rate limiting
          const limitedResults = results.slice(0, 20);
          
          for (const place of limitedResults) {
            if (place.place_id) {
              // Get detailed information
              const detailedPlace = await getPlaceDetails(place.place_id);
              if (detailedPlace) {
                detailedRestaurants.push(convertPlaceToRestaurant(detailedPlace));
              }
            }
          }
          
          setRestaurants(detailedRestaurants);
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

// Enhanced hook for getting directions
export const useGoogleDirections = () => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDirections = async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: { lat: number; lng: number }[],
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ) => {
    setLoading(true);
    setError(null);

    try {
      if (!window.google?.maps) {
        throw new Error('Google Maps not loaded');
      }

      const directionsService = new google.maps.DirectionsService();
      
      const waypointObjects = waypoints?.map(point => ({
        location: new google.maps.LatLng(point.lat, point.lng),
        stopover: true
      })) || [];

      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: waypointObjects,
        travelMode,
        optimizeWaypoints: true,
        unitSystem: google.maps.UnitSystem.METRIC
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          setError(`Directions request failed: ${status}`);
        }
        setLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get directions');
      setLoading(false);
    }
  };

  return {
    directions,
    loading,
    error,
    getDirections,
    clearDirections: () => setDirections(null)
  };
};

// Helper functions
const formatOpeningHours = (openingHours?: google.maps.places.PlaceOpeningHours): string => {
  if (!openingHours) return 'Hours not available';
  
  if (openingHours.open_now === false) return 'Currently closed';
  if (openingHours.open_now === true) return 'Open now';
  
  return 'Hours not available';
};

const generateDescription = (place: google.maps.places.PlaceResult): string => {
  const cuisine = getCuisineFromTypes(place.types || []);
  const rating = place.rating ? `${place.rating} star rating` : 'no rating';
  const priceLevel = place.price_level ? 
    ['budget-friendly', 'moderately priced', 'upscale', 'fine dining'][place.price_level - 1] : '';
  
  return `${cuisine} restaurant with ${rating}${priceLevel ? `, ${priceLevel}` : ''}`;
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
    'mediterranean_restaurant': 'Mediterranean',
    'korean_restaurant': 'Korean',
    'vietnamese_restaurant': 'Vietnamese',
    'greek_restaurant': 'Greek',
    'turkish_restaurant': 'Turkish',
    'spanish_restaurant': 'Spanish',
    'middle_eastern_restaurant': 'Middle Eastern',
    'barbecue_restaurant': 'BBQ',
    'burger_restaurant': 'Burgers',
    'sandwich_shop': 'Sandwiches',
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