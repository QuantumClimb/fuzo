export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationResult {
  coordinates: LocationCoordinates;
  address?: string;
  error?: string;
}

/**
 * Get user's current location using the Geolocation API
 */
export const getCurrentLocation = (): Promise<LocationResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        coordinates: { lat: 0, lng: 0 },
        error: 'Geolocation is not supported by this browser'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        resolve({
          coordinates: { lat: 0, lng: 0 },
          error: errorMessage
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Convert coordinates to address using Google Geocoding API
 */
export const reverseGeocode = (
  coordinates: LocationCoordinates
): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof google === 'undefined' || !google.maps) {
      resolve(`${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`);
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: coordinates },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve(`${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`);
        }
      }
    );
  });
};

/**
 * Calculate distance between two coordinates (in kilometers)
 */
export const calculateDistance = (
  coord1: LocationCoordinates,
  coord2: LocationCoordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Find nearby restaurants within a given radius
 */
export const findNearbyRestaurants = <T extends { coordinates: LocationCoordinates }>(
  userLocation: LocationCoordinates,
  restaurants: T[],
  radiusKm: number = 5
): (T & { distance: number })[] => {
  return restaurants
    .map(restaurant => ({
      ...restaurant,
      distance: calculateDistance(userLocation, restaurant.coordinates)
    }))
    .filter(restaurant => restaurant.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}; 