import { useState, useEffect, useCallback } from 'react';
import { Restaurant } from '@/types';

// Enhanced restaurant interface with Google Places data
export interface DetailedRestaurant {
  id: string;
  name: string;
  cuisine?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
  hours?: string;
  image: string;
  phoneNumber?: string;
  website?: string;
  description?: string;
  detailedPhotos?: string[];
  detailedReviews?: Array<{
    id: string;
    author: string;
    avatar: string;
    rating: number;
    text: string;
    time: string;
    relativeTime: string;
  }>;
  businessStatus?: string;
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  openingHours?: {
    isOpen?: boolean;
    weekday_text?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
  geometry?: {
    location: { lat: number; lng: number };
    viewport?: any;
  };
  url?: string;
  price_level?: number;
  types?: string[];
}

interface UseGooglePlacesProps {
  location: { lat: number; lng: number };
  radius?: number;
  type?: string;
  keyword?: string;
  enabled?: boolean;
}

interface UseGooglePlacesReturn {
  restaurants: DetailedRestaurant[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Define the enhanced Google Places interface for the new API
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Place: any;
          SearchNearbyRequest: any;
          PlaceResult: any;
          PlacesService: any;
          PlacesServiceStatus: any;
          RankBy: any;
        };
        Map: any;
        LatLng: any;
        geometry: {
          spherical: {
            computeDistanceBetween: (a: any, b: any) => number;
          };
        };
      };
    };
  }
}

export const useGooglePlaces = ({
  location,
  radius = 1500,
  type = 'restaurant',
  keyword = '',
  enabled = true
}: UseGooglePlacesProps): UseGooglePlacesReturn => {
  const [restaurants, setRestaurants] = useState<DetailedRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get cuisine type from place types
  const getCuisineFromTypes = (types: string[] = []): string => {
    const cuisineMap: { [key: string]: string } = {
      'chinese_restaurant': 'Chinese',
      'japanese_restaurant': 'Japanese',
      'indian_restaurant': 'Indian',
      'italian_restaurant': 'Italian',
      'mexican_restaurant': 'Mexican',
      'thai_restaurant': 'Thai',
      'french_restaurant': 'French',
      'american_restaurant': 'American',
      'korean_restaurant': 'Korean',
      'vietnamese_restaurant': 'Vietnamese',
      'greek_restaurant': 'Greek',
      'mediterranean_restaurant': 'Mediterranean',
      'pizza': 'Pizza',
      'bakery': 'Bakery',
      'cafe': 'Cafe',
      'fast_food': 'Fast Food',
      'seafood_restaurant': 'Seafood'
    };

    for (const type of types) {
      if (cuisineMap[type]) {
        return cuisineMap[type];
      }
    }
    return 'Restaurant';
  };

  // Helper function to get price range string
  const getPriceRange = (priceLevel?: number): string => {
    switch (priceLevel) {
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return '';
    }
  };

  // Helper function to get high-quality photo URL
  const getPhotoUrl = (photoReference: string, maxWidth: number = 800): string => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
  };

  // Convert Google Place to our DetailedRestaurant format
  const convertToDetailedRestaurant = async (place: any): Promise<DetailedRestaurant> => {
    const baseRestaurant: DetailedRestaurant = {
      id: place.place_id || place.id || Math.random().toString(),
      name: place.name || 'Unknown Restaurant',
      cuisine: getCuisineFromTypes(place.types),
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      priceRange: getPriceRange(place.price_level),
      coordinates: place.geometry?.location ? {
        lat: typeof place.geometry.location.lat === 'function' 
          ? place.geometry.location.lat() 
          : place.geometry.location.lat,
        lng: typeof place.geometry.location.lng === 'function' 
          ? place.geometry.location.lng() 
          : place.geometry.location.lng
      } : undefined,
      address: place.vicinity || place.formatted_address,
      image: place.photos?.[0] 
        ? getPhotoUrl(place.photos[0].photo_reference)
        : `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80`,
      phoneNumber: place.formatted_phone_number || place.international_phone_number,
      website: place.website,
      description: place.editorial_summary?.overview || `Experience great ${getCuisineFromTypes(place.types)} cuisine at ${place.name}.`,
      businessStatus: place.business_status,
      formattedAddress: place.formatted_address,
      internationalPhoneNumber: place.international_phone_number,
      geometry: place.geometry,
      url: place.url,
      price_level: place.price_level,
      types: place.types
    };

    // Get detailed photos
    if (place.photos && place.photos.length > 0) {
      baseRestaurant.detailedPhotos = place.photos
        .slice(0, 5)
        .map((photo: any) => getPhotoUrl(photo.photo_reference, 1200));
    }

    // Handle opening hours with new API
    if (place.opening_hours) {
      baseRestaurant.openingHours = {
        isOpen: place.opening_hours.isOpen?.() || place.opening_hours.open_now,
        weekday_text: place.opening_hours.weekday_text,
        periods: place.opening_hours.periods
      };
    }

    // Get detailed reviews
    if (place.reviews && place.reviews.length > 0) {
      baseRestaurant.detailedReviews = place.reviews.slice(0, 5).map((review: any, index: number) => ({
        id: `${place.place_id}_review_${index}`,
        author: review.author_name,
        avatar: review.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=random`,
        rating: review.rating,
        text: review.text,
        time: new Date(review.time * 1000).toISOString(),
        relativeTime: review.relative_time_description
      }));
    }

    return baseRestaurant;
  };

  // Enhanced function to get detailed place information using the new Places API
  const getPlaceDetails = useCallback(async (placeId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!window.google?.maps?.places?.PlacesService) {
        reject(new Error('Google Places API not loaded'));
        return;
      }

      const map = new window.google.maps.Map(document.createElement('div'));
      const service = new window.google.maps.places.PlacesService(map);

      const request = {
        placeId: placeId,
        fields: [
          'place_id', 'name', 'rating', 'user_ratings_total', 'price_level',
          'formatted_address', 'geometry', 'photos', 'opening_hours',
          'formatted_phone_number', 'international_phone_number', 'website',
          'reviews', 'types', 'business_status', 'url', 'vicinity',
          'editorial_summary'
        ]
      };

      service.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error(`Place details request failed: ${status}`));
        }
      });
    });
  }, []);

  // Main function to search for restaurants
  const searchRestaurants = useCallback(async () => {
    if (!enabled || !window.google?.maps?.places?.PlacesService) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const map = new window.google.maps.Map(document.createElement('div'));
      const service = new window.google.maps.places.PlacesService(map);

      // Create search request
      const request: any = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: radius,
        type: type,
        keyword: keyword || undefined
      };

      // Perform nearby search
      const searchResults = await new Promise<any[]>((resolve, reject) => {
        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`Places search failed: ${status}`));
          }
        });
      });

      // Get detailed information for each place
      const detailedRestaurants: DetailedRestaurant[] = [];
      
      for (const place of searchResults.slice(0, 20)) { // Limit to 20 results
        try {
          let detailedPlace = place;
          
          // Get additional details if we have a place_id
          if (place.place_id) {
            try {
              detailedPlace = await getPlaceDetails(place.place_id);
            } catch (detailError) {
              console.warn('Failed to get place details:', detailError);
              // Use the basic place data as fallback
            }
          }

          const restaurant = await convertToDetailedRestaurant(detailedPlace);
          detailedRestaurants.push(restaurant);
        } catch (conversionError) {
          console.warn('Failed to convert place to restaurant:', conversionError);
        }
      }

      setRestaurants(detailedRestaurants);
    } catch (searchError) {
      console.error('Restaurant search failed:', searchError);
      setError(searchError instanceof Error ? searchError.message : 'Failed to search restaurants');
      
      // Provide fallback mock data
      setRestaurants([
        {
          id: 'fallback_1',
          name: 'Local Restaurant',
          cuisine: 'Multi-Cuisine',
          rating: 4.2,
          reviewCount: 150,
          priceRange: '$$',
          coordinates: location,
          address: 'Near your location',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
          description: 'Great local dining experience with diverse menu options.',
          openingHours: {
            isOpen: true,
            weekday_text: ['Open daily 11:00 AM - 11:00 PM']
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [location, radius, type, keyword, enabled, getPlaceDetails]);

  // Effect to trigger search when parameters change
  useEffect(() => {
    if (enabled && location.lat && location.lng) {
      searchRestaurants();
    }
  }, [searchRestaurants, enabled, location.lat, location.lng]);

  // Refetch function
  const refetch = useCallback(() => {
    searchRestaurants();
  }, [searchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refetch
  };
};

// Hook for getting directions
export const useGoogleDirections = () => {
  const [directions, setDirections] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDirections = useCallback(async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    travelMode: 'DRIVING' | 'WALKING' | 'TRANSIT' = 'DRIVING'
  ) => {
    if (!window.google?.maps?.DirectionsService) {
      setError('Google Directions API not loaded');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      const request = {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode[travelMode]
      };

      const result = await new Promise((resolve, reject) => {
        directionsService.route(request, (result: any, status: any) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      setDirections(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get directions');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    directions,
    loading,
    error,
    getDirections
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